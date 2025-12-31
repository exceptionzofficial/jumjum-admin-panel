// Invoice Generator Utility for TASMAC-style reports
// Generates PDF and CSV exports

// Format currency in INR
export const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Generate Invoice Number
export const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `JJ${year}${month}${day}${random}`;
};

// Aggregate items from multiple bills
export const aggregateItems = (bills, category = 'all') => {
    const itemsMap = new Map();

    bills.forEach(bill => {
        const items = bill.items || [];
        items.forEach(item => {
            // Filter by category
            if (category === 'kitchen' && !item.isKitchen) return;
            if (category === 'bar' && item.isKitchen) return;

            const key = item.itemId || item.name;
            if (itemsMap.has(key)) {
                const existing = itemsMap.get(key);
                existing.quantity += item.quantity || 1;
                existing.totalAmount += (item.price || 0) * (item.quantity || 1);
            } else {
                itemsMap.set(key, {
                    itemId: item.itemId || '',
                    name: item.name || 'Unknown Item',
                    packSize: item.packSize || '-',
                    category: item.category || (item.isKitchen ? 'Kitchen' : 'Bar'),
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    totalAmount: (item.price || 0) * (item.quantity || 1),
                });
            }
        });
    });

    return Array.from(itemsMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};

// Calculate totals
export const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const gst = subtotal * 0.05; // 5% GST
    const grandTotal = subtotal + gst;

    return {
        subtotal,
        totalQuantity,
        gst,
        grandTotal,
        itemCount: items.length
    };
};

// Generate CSV content
export const generateCSV = (items, totals, dateRange, category) => {
    const headers = ['S.No', 'Item ID', 'Item Name', 'Pack Size', 'Category', 'Quantity', 'Rate (₹)', 'Amount (₹)'];

    let csv = `SRI KALKI JAM JAM RESORTS - BILLING REPORT\n`;
    csv += `Date Range: ${dateRange}\n`;
    csv += `Category: ${category}\n`;
    csv += `Generated: ${formatDate(new Date())}\n\n`;
    csv += headers.join(',') + '\n';

    items.forEach((item, index) => {
        csv += [
            index + 1,
            item.itemId,
            `"${item.name}"`,
            item.packSize,
            item.category,
            item.quantity,
            item.price.toFixed(2),
            item.totalAmount.toFixed(2)
        ].join(',') + '\n';
    });

    csv += `\nTOTAL,,,,${totals.totalQuantity},,${totals.subtotal.toFixed(2)}\n`;
    csv += `GST (5%),,,,,,${totals.gst.toFixed(2)}\n`;
    csv += `GRAND TOTAL,,,,,,${totals.grandTotal.toFixed(2)}\n`;

    return csv;
};

// Download CSV file
export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

// Generate printable HTML for PDF
export const generatePrintableHTML = (items, totals, dateRange, category, businessInfo) => {
    const itemRows = items.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.itemId || '-'}</td>
            <td>${item.name}</td>
            <td>${item.packSize}</td>
            <td>${item.category}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(item.totalAmount)}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <title>SRI KALKI JAM JAM RESORTS - Billing Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; }
        .header p { margin: 2px 0; color: #555; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .meta-left, .meta-right { }
        .meta-right { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .totals-row { font-weight: bold; background: #f9f9f9; }
        .grand-total { font-size: 14px; background: #e8e8e8; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature { text-align: center; padding-top: 40px; border-top: 1px solid #333; width: 200px; }
        @media print { body { padding: 10px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍺 SRI KALKI JAM JAM RESORTS - BILLING REPORT</h1>
        <p>${businessInfo?.name || 'SRI KALKI JAM JAM RESORTS'}</p>
        <p>GSTIN: ${businessInfo?.gstin || 'XXXXXXXXXXXXXXXXX'}</p>
    </div>

    <div class="meta">
        <div class="meta-left">
            <p><strong>Report Type:</strong> ${category.toUpperCase()} ITEMS</p>
            <p><strong>Date Range:</strong> ${dateRange}</p>
            <p><strong>Total Items:</strong> ${totals.itemCount}</p>
        </div>
        <div class="meta-right">
            <p><strong>Invoice No:</strong> ${generateInvoiceNumber()}</p>
            <p><strong>Generated:</strong> ${formatDate(new Date())}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">S.No</th>
                <th width="12%">Item ID</th>
                <th width="30%">Item Name</th>
                <th width="10%">Pack Size</th>
                <th width="10%">Category</th>
                <th width="8%" class="text-right">Qty</th>
                <th width="12%" class="text-right">Rate</th>
                <th width="13%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${itemRows}
            <tr class="totals-row">
                <td colspan="5" class="text-right">SUBTOTAL</td>
                <td class="text-right">${totals.totalQuantity}</td>
                <td></td>
                <td class="text-right">${formatCurrency(totals.subtotal)}</td>
            </tr>
            <tr class="totals-row">
                <td colspan="7" class="text-right">GST (5%)</td>
                <td class="text-right">${formatCurrency(totals.gst)}</td>
            </tr>
            <tr class="totals-row grand-total">
                <td colspan="7" class="text-right">GRAND TOTAL</td>
                <td class="text-right">${formatCurrency(totals.grandTotal)}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <div class="signature">Prepared By</div>
        <div class="signature">Authorized Signatory</div>
    </div>
</body>
</html>
    `;
};

// Print / Download as PDF
export const printReport = (items, totals, dateRange, category, businessInfo) => {
    const html = generatePrintableHTML(items, totals, dateRange, category, businessInfo);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
};

export default {
    formatCurrency,
    formatDate,
    generateInvoiceNumber,
    aggregateItems,
    calculateTotals,
    generateCSV,
    downloadCSV,
    generatePrintableHTML,
    printReport
};

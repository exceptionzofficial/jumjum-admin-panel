import { useState, useEffect } from 'react';
import {
    FileText, Download, Printer, Calendar, Filter,
    TrendingUp, Receipt, ChefHat, Beer, RefreshCw, User, Phone, Hash
} from 'lucide-react';
import { billingApi } from '../services/api';
import {
    formatCurrency, formatDate, aggregateItems, calculateTotals,
    generateCSV, downloadCSV, printReport
} from '../utils/invoiceGenerator';
import './BillingReports.css';

function BillingReports() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('today');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [viewMode, setViewMode] = useState('items'); // 'items' or 'bills'

    // Load bills based on date filter
    useEffect(() => {
        loadBills();
    }, [dateFilter, customStartDate, customEndDate]);

    const loadBills = async () => {
        setLoading(true);
        try {
            let data = [];
            switch (dateFilter) {
                case 'today':
                    data = await billingApi.getToday();
                    break;
                case 'weekly':
                    data = await billingApi.getWeekly();
                    break;
                case 'monthly':
                    data = await billingApi.getMonthly();
                    break;
                case 'yearly':
                    data = await billingApi.getYearly();
                    break;
                case 'custom':
                    if (customStartDate && customEndDate) {
                        data = await billingApi.getByDateRange(customStartDate, customEndDate);
                    }
                    break;
                default:
                    data = await billingApi.getAll(500);
            }
            setBills(data || []);
        } catch (error) {
            console.error('Failed to load bills:', error);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    // Get aggregated items based on category filter
    const aggregatedItems = aggregateItems(bills, categoryFilter);
    const totals = calculateTotals(aggregatedItems);

    // Get date range string for display
    const getDateRangeString = () => {
        const today = new Date();
        switch (dateFilter) {
            case 'today':
                return formatDate(today);
            case 'weekly':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return `${formatDate(weekAgo)} - ${formatDate(today)}`;
            case 'monthly':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return `${formatDate(monthStart)} - ${formatDate(today)}`;
            case 'yearly':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return `${formatDate(yearStart)} - ${formatDate(today)}`;
            case 'custom':
                if (customStartDate && customEndDate) {
                    return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
                }
                return 'Select dates';
            default:
                return 'All Time';
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get customer info
    const getCustomerName = (customer) => customer?.name || 'Walk-in';
    const getCustomerPhone = (customer) => customer?.phone || '-';
    const getTableNumber = (customer) => customer?.tableNumber || '-';

    // Handle CSV download
    const handleDownloadCSV = () => {
        const csv = generateCSV(aggregatedItems, totals, getDateRangeString(), categoryFilter);
        const filename = `jumjum-report-${dateFilter}-${categoryFilter}-${Date.now()}.csv`;
        downloadCSV(csv, filename);
    };

    // Handle Print/PDF
    const handlePrint = () => {
        printReport(aggregatedItems, totals, getDateRangeString(), categoryFilter, {
            name: 'SRI KALKI JAM JAM RESORTS',
            gstin: '33AFBFS6465F1ZZ'
        });
    };

    // Print bills with customer details
    const handlePrintBills = () => {
        const printWindow = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Customer Bills Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #E65100; }
                    .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #E65100; color: white; }
                    .items { font-size: 0.9em; color: #666; }
                    .total { font-weight: bold; color: #E65100; }
                    .bill-card { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
                    .bill-header { background: #f5f5f5; padding: 12px; display: flex; justify-content: space-between; }
                    .bill-body { padding: 12px; }
                    .item-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
                    .grand-total { font-size: 1.2em; font-weight: bold; margin-top: 30px; text-align: right; }
                </style>
            </head>
            <body>
                <h1>🍺 JUMJUM - CUSTOMER BILLS REPORT</h1>
                <p class="subtitle">${getDateRangeString()} | ${bills.length} Bills | Total: ${formatCurrency(totals.grandTotal)}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Bill ID</th>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Table</th>
                            <th>Date/Time</th>
                            <th>Items</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bills.map(bill => `
                            <tr>
                                <td>${bill.billid || bill.billId}</td>
                                <td>${getCustomerName(bill.customer)}</td>
                                <td>${getCustomerPhone(bill.customer)}</td>
                                <td>${getTableNumber(bill.customer)}</td>
                                <td>${formatTime(bill.createdAt)}</td>
                                <td class="items">${(bill.items || []).map(i => `${i.quantity}× ${i.name}`).join(', ')}</td>
                                <td class="total">${formatCurrency(bill.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <p class="grand-total">Grand Total: ${formatCurrency(bills.reduce((sum, b) => sum + (b.total || 0), 0))}</p>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    // Calculate category-specific stats
    const kitchenItems = aggregateItems(bills, 'kitchen');
    const barItems = aggregateItems(bills, 'bar');
    const kitchenTotal = calculateTotals(kitchenItems).grandTotal;
    const barTotal = calculateTotals(barItems).grandTotal;

    return (
        <div className="billing-reports">
            <div className="page-header">
                <div className="header-title">
                    <FileText size={28} />
                    <div>
                        <h1>Billing Reports</h1>
                        <p>View and download billing summaries</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={loadBills}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card total">
                    <div className="card-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-label">Total Revenue</span>
                        <span className="card-value">{formatCurrency(totals.grandTotal)}</span>
                    </div>
                </div>
                <div className="summary-card bills">
                    <div className="card-icon">
                        <Receipt size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-label">Total Bills</span>
                        <span className="card-value">{bills.length}</span>
                    </div>
                </div>
                <div className="summary-card kitchen">
                    <div className="card-icon">
                        <ChefHat size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-label">Kitchen Revenue</span>
                        <span className="card-value">{formatCurrency(kitchenTotal)}</span>
                    </div>
                </div>
                <div className="summary-card bar">
                    <div className="card-icon">
                        <Beer size={24} />
                    </div>
                    <div className="card-content">
                        <span className="card-label">Bar Revenue</span>
                        <span className="card-value">{formatCurrency(barTotal)}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label><Calendar size={16} /> Date Range</label>
                    <div className="date-filters">
                        {['today', 'weekly', 'monthly', 'yearly', 'custom'].map(filter => (
                            <button
                                key={filter}
                                className={`filter-btn ${dateFilter === filter ? 'active' : ''}`}
                                onClick={() => setDateFilter(filter)}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                    {dateFilter === 'custom' && (
                        <div className="custom-dates">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="filter-group">
                    <label><Filter size={16} /> View Mode</label>
                    <div className="category-filters">
                        <button
                            className={`filter-btn ${viewMode === 'items' ? 'active' : ''}`}
                            onClick={() => setViewMode('items')}
                        >
                            <Receipt size={16} /> Items Summary
                        </button>
                        <button
                            className={`filter-btn ${viewMode === 'bills' ? 'active' : ''}`}
                            onClick={() => setViewMode('bills')}
                        >
                            <User size={16} /> Customer Bills
                        </button>
                    </div>
                </div>

                <div className="filter-group actions">
                    <label>Export</label>
                    <div className="export-buttons">
                        <button className="btn btn-primary" onClick={viewMode === 'items' ? handlePrint : handlePrintBills}>
                            <Printer size={18} />
                            Print / PDF
                        </button>
                        <button className="btn btn-secondary" onClick={handleDownloadCSV}>
                            <Download size={18} />
                            Download CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Info */}
            <div className="report-info">
                <span>📅 {getDateRangeString()}</span>
                <span>📦 {aggregatedItems.length} items</span>
                <span>🧾 {bills.length} bills</span>
            </div>

            {/* Table Content */}
            <div className="report-table-container">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : viewMode === 'items' ? (
                    /* Items Summary View */
                    aggregatedItems.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <h3>No Data Found</h3>
                            <p>No bills found for the selected filters</p>
                        </div>
                    ) : (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Item ID</th>
                                    <th>Item Name</th>
                                    <th>Pack Size</th>
                                    <th>Category</th>
                                    <th className="text-right">Quantity</th>
                                    <th className="text-right">Rate</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aggregatedItems.map((item, index) => (
                                    <tr key={item.itemId || index}>
                                        <td>{index + 1}</td>
                                        <td className="item-id">{item.itemId || '-'}</td>
                                        <td className="item-name">{item.name}</td>
                                        <td>{item.packSize}</td>
                                        <td>
                                            <span className={`category-badge ${item.category.toLowerCase()}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="text-right">{item.quantity}</td>
                                        <td className="text-right">{formatCurrency(item.price)}</td>
                                        <td className="text-right amount">{formatCurrency(item.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="subtotal-row">
                                    <td colSpan="5" className="text-right">Subtotal</td>
                                    <td className="text-right">{totals.totalQuantity}</td>
                                    <td></td>
                                    <td className="text-right">{formatCurrency(totals.subtotal)}</td>
                                </tr>
                                <tr className="gst-row">
                                    <td colSpan="7" className="text-right">GST (5%)</td>
                                    <td className="text-right">{formatCurrency(totals.gst)}</td>
                                </tr>
                                <tr className="grand-total-row">
                                    <td colSpan="7" className="text-right">Grand Total</td>
                                    <td className="text-right">{formatCurrency(totals.grandTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )
                ) : (
                    /* Customer Bills View */
                    bills.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <h3>No Bills Found</h3>
                            <p>No bills found for the selected filters</p>
                        </div>
                    ) : (
                        <table className="report-table bills-table">
                            <thead>
                                <tr>
                                    <th>Bill ID</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Table</th>
                                    <th>Date/Time</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.billid || bill.billId}>
                                        <td className="item-id">{bill.billid || bill.billId}</td>
                                        <td className="customer-name">
                                            <User size={14} />
                                            {getCustomerName(bill.customer)}
                                        </td>
                                        <td>
                                            <Phone size={14} />
                                            {getCustomerPhone(bill.customer)}
                                        </td>
                                        <td>
                                            {getTableNumber(bill.customer) !== '-' && (
                                                <span className="table-badge">
                                                    <Hash size={14} />
                                                    {getTableNumber(bill.customer)}
                                                </span>
                                            )}
                                        </td>
                                        <td>{formatTime(bill.createdAt)}</td>
                                        <td className="items-cell">
                                            {(bill.items || []).map((item, idx) => (
                                                <span key={idx} className="item-tag">
                                                    {item.quantity}× {item.name}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${bill.status || 'open'}`}>
                                                {(bill.status || 'open').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-right amount">{formatCurrency(bill.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="grand-total-row">
                                    <td colSpan="7" className="text-right">Grand Total</td>
                                    <td className="text-right">{formatCurrency(bills.reduce((sum, b) => sum + (b.total || 0), 0))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}

export default BillingReports;

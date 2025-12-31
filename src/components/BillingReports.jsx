import { useState, useEffect } from 'react';
import {
    FileText, Download, Printer, Calendar, Filter,
    TrendingUp, Receipt, ChefHat, Beer, RefreshCw
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

    // Handle CSV download
    const handleDownloadCSV = () => {
        const csv = generateCSV(aggregatedItems, totals, getDateRangeString(), categoryFilter);
        const filename = `jumjum-report-${dateFilter}-${categoryFilter}-${Date.now()}.csv`;
        downloadCSV(csv, filename);
    };

    // Handle Print/PDF
    const handlePrint = () => {
        printReport(aggregatedItems, totals, getDateRangeString(), categoryFilter, {
            name: 'JumJum Restaurant & Bar',
            gstin: '33AAACT2984P1ZY'
        });
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
                    <label><Filter size={16} /> Category</label>
                    <div className="category-filters">
                        {[
                            { id: 'all', label: 'All Items', icon: Receipt },
                            { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
                            { id: 'bar', label: 'Bar', icon: Beer }
                        ].map(cat => (
                            <button
                                key={cat.id}
                                className={`filter-btn ${categoryFilter === cat.id ? 'active' : ''}`}
                                onClick={() => setCategoryFilter(cat.id)}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-group actions">
                    <label>Export</label>
                    <div className="export-buttons">
                        <button className="btn btn-primary" onClick={handlePrint}>
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

            {/* Items Table */}
            <div className="report-table-container">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : aggregatedItems.length === 0 ? (
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
                )}
            </div>
        </div>
    );
}

export default BillingReports;

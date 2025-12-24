import { useState } from 'react';
import { Search, Clock, User, Phone, ChefHat, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Orders.css';

function Orders() {
    const { orders, loadOrders, loading } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
    const formatDate = (timestamp) => new Date(timestamp).toLocaleString('en-IN');

    const filterOrders = () => {
        let filtered = orders;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(o =>
                o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.billId?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Date filter
        const now = new Date();
        if (dateFilter === 'today') {
            filtered = filtered.filter(o =>
                new Date(o.createdAt).toDateString() === now.toDateString()
            );
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(o => new Date(o.createdAt) >= weekAgo);
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(o => new Date(o.createdAt) >= monthAgo);
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const filteredOrders = filterOrders();

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    if (loading) {
        return (
            <div className="orders-page loading">
                <div className="loading-spinner">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h1>📋 Order History</h1>
                    <p>View all past orders and transactions</p>
                </div>
                <div className="header-stats">
                    <div className="header-stat">
                        <span className="stat-label">Orders</span>
                        <span className="stat-value">{filteredOrders.length}</span>
                    </div>
                    <div className="header-stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <button className="btn btn-secondary" onClick={loadOrders}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search by customer or bill ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="orders-list">
                {filteredOrders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📭</div>
                        <h3>No orders found</h3>
                        <p>Orders will appear here once placed from the billing app</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const kitchenItems = order.kitchenItems || [];
                        const barItems = order.barItems || [];

                        return (
                            <div key={order.billId} className="order-card">
                                <div className="order-header">
                                    <div className="order-id">
                                        <span className="id-label">Bill</span>
                                        <span className="id-value">#{order.billId?.slice(-8)}</span>
                                    </div>
                                    <div className="order-time">
                                        <Clock size={16} />
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="order-customer">
                                    <div className="customer-info">
                                        <User size={16} />
                                        <span>{order.customer?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="customer-info">
                                        <Phone size={16} />
                                        <span>{order.customer?.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="order-items">
                                    {barItems.length > 0 && (
                                        <div className="items-section">
                                            <span className="section-label">🍺 Bar</span>
                                            <div className="items-list">
                                                {barItems.map((item, idx) => (
                                                    <span key={idx} className="item-tag">
                                                        {item.quantity}× {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {kitchenItems.length > 0 && (
                                        <div className="items-section kitchen">
                                            <span className="section-label">
                                                <ChefHat size={14} /> Kitchen
                                            </span>
                                            <div className="items-list">
                                                {kitchenItems.map((item, idx) => (
                                                    <span key={idx} className="item-tag kitchen">
                                                        {item.quantity}× {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="order-footer">
                                    <span className="items-count">{order.items?.length || 0} items</span>
                                    <span className="order-total">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Orders;

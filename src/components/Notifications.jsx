import { useState } from 'react';
import { Bell, AlertTriangle, Package, Plus, Check, Clock, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';
import './Notifications.css';

function Notifications() {
    const { menuItems, updateStock, getStats } = useData();
    const [filter, setFilter] = useState('all');
    const stats = getStats();

    const getStockStatus = (item) => {
        if (item.stock === 0) return 'out';
        if (item.stock <= item.lowStockThreshold) return 'low';
        return 'ok';
    };

    // Generate notifications for low stock and out of stock items
    const notifications = menuItems
        .filter(item => getStockStatus(item) !== 'ok')
        .map(item => ({
            id: item.id,
            type: item.stock === 0 ? 'danger' : 'warning',
            title: item.stock === 0 ? 'Out of Stock' : 'Low Stock Alert',
            message: `${item.name} ${item.stock === 0 ? 'is out of stock' : `has only ${item.stock} units left`}`,
            item: item,
            itemId: item.itemId || (item.isKitchen ? `KIT-${item.id}` : `BAR-${item.id}`),
            category: item.isKitchen ? 'Kitchen' : 'Bar',
            timestamp: new Date(),
        }))
        .sort((a, b) => (a.type === 'danger' ? -1 : 1));

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'out') return n.type === 'danger';
        if (filter === 'low') return n.type === 'warning';
        if (filter === 'bar') return n.item && !n.item.isKitchen;
        if (filter === 'kitchen') return n.item && n.item.isKitchen;
        return true;
    });

    const handleQuickRestock = (item, amount) => {
        updateStock(item.id, amount);
        toast.success(`Added ${amount} units to ${item.name}`);
    };

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="notifications-page">
            <div className="page-header">
                <div className="header-title">
                    <Bell size={32} className="header-icon" />
                    <div>
                        <h1>🔔 Notifications</h1>
                        <p>Stock alerts and system notifications</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="notification-summary">
                <div className="summary-card danger" onClick={() => setFilter('out')}>
                    <AlertTriangle size={28} />
                    <div>
                        <span className="summary-value">{stats.outOfStockItems.length}</span>
                        <span className="summary-label">Out of Stock</span>
                    </div>
                </div>
                <div className="summary-card warning" onClick={() => setFilter('low')}>
                    <Package size={28} />
                    <div>
                        <span className="summary-value">{stats.lowStockItems.length}</span>
                        <span className="summary-label">Low Stock</span>
                    </div>
                </div>
                <div className="summary-card info" onClick={() => setFilter('all')}>
                    <Bell size={28} />
                    <div>
                        <span className="summary-value">{notifications.length}</span>
                        <span className="summary-label">Total Alerts</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Alerts
                </button>
                <button
                    className={`filter-tab danger ${filter === 'out' ? 'active' : ''}`}
                    onClick={() => setFilter('out')}
                >
                    ❌ Out of Stock
                </button>
                <button
                    className={`filter-tab warning ${filter === 'low' ? 'active' : ''}`}
                    onClick={() => setFilter('low')}
                >
                    ⚠️ Low Stock
                </button>
                <button
                    className={`filter-tab bar ${filter === 'bar' ? 'active' : ''}`}
                    onClick={() => setFilter('bar')}
                >
                    🍺 Bar Items
                </button>
                <button
                    className={`filter-tab kitchen ${filter === 'kitchen' ? 'active' : ''}`}
                    onClick={() => setFilter('kitchen')}
                >
                    🍳 Kitchen Items
                </button>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <h3>No alerts!</h3>
                        <p>All items are well stocked</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div key={notification.id} className={`notification-card ${notification.type}`}>
                            <div className="notification-icon">
                                {notification.type === 'danger' ? (
                                    <AlertTriangle size={24} />
                                ) : (
                                    <Package size={24} />
                                )}
                            </div>

                            <div className="notification-content">
                                <div className="notification-header">
                                    <span className={`notification-badge ${notification.type}`}>
                                        {notification.title}
                                    </span>
                                    <span className={`category-tag ${notification.item?.isKitchen ? 'kitchen' : 'bar'}`}>
                                        {notification.category}
                                    </span>
                                </div>

                                <h4 className="notification-title">{notification.item?.name}</h4>
                                <p className="notification-message">{notification.message}</p>

                                <div className="notification-meta">
                                    <span className="item-id-tag">
                                        ID: {notification.itemId}
                                    </span>
                                    <span className="price-tag">
                                        {formatCurrency(notification.item?.price)}
                                    </span>
                                    <span className="stock-level">
                                        Current: <strong>{notification.item?.stock}</strong> / Threshold: {notification.item?.lowStockThreshold}
                                    </span>
                                </div>
                            </div>

                            <div className="notification-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleQuickRestock(notification.item, 10)}
                                >
                                    <Plus size={16} />
                                    +10
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleQuickRestock(notification.item, 25)}
                                >
                                    <Plus size={16} />
                                    +25
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleQuickRestock(notification.item, 50)}
                                >
                                    <Plus size={16} />
                                    +50
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notifications;

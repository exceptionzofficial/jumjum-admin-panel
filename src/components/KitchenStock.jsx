import { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, CheckCircle, RefreshCw, Search } from 'lucide-react';
import './KitchenStock.css';

const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://jumjum-backend.vercel.app/api';

function KitchenStock() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, low, out
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/kitchen-inventory`);
            const data = await response.json();
            if (data.success) {
                setItems(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefill = async (inventoryId, currentQty) => {
        const newQty = prompt('Enter refill quantity:', currentQty);
        if (newQty === null) return;

        try {
            const response = await fetch(`${API_BASE_URL}/kitchen-inventory/${inventoryId}/refill`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: parseInt(newQty) }),
            });
            const data = await response.json();
            if (data.success) {
                loadInventory();
            }
        } catch (error) {
            console.error('Failed to refill:', error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'low': return <AlertTriangle size={16} />;
            case 'out': return <XCircle size={16} />;
            default: return <CheckCircle size={16} />;
        }
    };

    const filteredItems = items.filter(item => {
        // Filter by status
        if (filter === 'low' && item.status !== 'low') return false;
        if (filter === 'out' && item.status !== 'out') return false;
        if (filter === 'alerts' && item.status === 'available') return false;

        // Filter by search
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    const lowCount = items.filter(i => i.status === 'low').length;
    const outCount = items.filter(i => i.status === 'out').length;

    return (
        <div className="kitchen-stock">
            <div className="page-header">
                <div className="header-title">
                    <Package size={28} />
                    <div>
                        <h1>Kitchen Stock</h1>
                        <p>View and manage kitchen inventory status</p>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={loadInventory}>
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Alert Cards */}
            <div className="alert-cards">
                <div className={`alert-card low ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}>
                    <AlertTriangle size={24} />
                    <div className="alert-info">
                        <span className="alert-count">{lowCount}</span>
                        <span className="alert-label">Low Stock</span>
                    </div>
                </div>
                <div className={`alert-card out ${filter === 'out' ? 'active' : ''}`} onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}>
                    <XCircle size={24} />
                    <div className="alert-info">
                        <span className="alert-count">{outCount}</span>
                        <span className="alert-label">Out of Stock</span>
                    </div>
                </div>
                <div className={`alert-card total ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    <Package size={24} />
                    <div className="alert-info">
                        <span className="alert-count">{items.length}</span>
                        <span className="alert-label">Total Items</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Items Table */}
            <div className="stock-table-container">
                {loading ? (
                    <div className="loading">Loading inventory...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No Items Found</h3>
                        <p>{filter !== 'all' ? 'No items match the selected filter' : 'Kitchen inventory is empty'}</p>
                    </div>
                ) : (
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Min Stock</th>
                                <th>Status</th>
                                <th>Last Refilled</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.inventoryId} className={`status-row-${item.status}`}>
                                    <td className="item-name">{item.name}</td>
                                    <td>
                                        <span className="qty">{item.quantity}</span>
                                        <span className="unit">{item.unit}</span>
                                    </td>
                                    <td>{item.minStock} {item.unit}</td>
                                    <td>
                                        <span className={`status-badge ${item.status}`}>
                                            {getStatusIcon(item.status)}
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {item.lastRefilled ? new Date(item.lastRefilled).toLocaleDateString('en-IN') : '-'}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleRefill(item.inventoryId, item.quantity)}
                                        >
                                            Refill
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default KitchenStock;

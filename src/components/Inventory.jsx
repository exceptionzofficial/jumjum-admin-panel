import { useState } from 'react';
import { Plus, Minus, AlertTriangle, Package, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';
import './Inventory.css';

function Inventory() {
    const { menuItems, updateStock, getStats } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [adjustAmount, setAdjustAmount] = useState('');

    const stats = getStats();

    const getStockStatus = (item) => {
        if (item.stock === 0) return 'out';
        if (item.stock <= item.lowStockThreshold) return 'low';
        return 'ok';
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const status = getStockStatus(item);
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'low' && (status === 'low' || status === 'out')) ||
            filterStatus === status;
        return matchesSearch && matchesStatus;
    });

    const handleQuickAdjust = (item, amount) => {
        updateStock(item.id, amount);
        toast.success(`Stock ${amount > 0 ? 'added' : 'removed'}: ${item.name}`);
    };

    const handleCustomAdjust = () => {
        if (!adjustingItem || !adjustAmount) return;
        const amount = parseInt(adjustAmount);
        if (isNaN(amount)) return;

        updateStock(adjustingItem.id, amount);
        toast.success(`Stock adjusted: ${adjustingItem.name}`);
        setAdjustingItem(null);
        setAdjustAmount('');
    };

    return (
        <div className="inventory">
            <div className="page-header">
                <div>
                    <h1>📦 Inventory</h1>
                    <p>Track and manage stock levels</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="inventory-summary">
                <div className="summary-card total">
                    <Package size={24} />
                    <div>
                        <span className="summary-value">{menuItems.length}</span>
                        <span className="summary-label">Total Items</span>
                    </div>
                </div>
                <div className="summary-card warning">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="summary-value">{stats.lowStockItems.length}</span>
                        <span className="summary-label">Low Stock</span>
                    </div>
                </div>
                <div className="summary-card danger">
                    <AlertTriangle size={24} />
                    <div>
                        <span className="summary-value">{stats.outOfStockItems.length}</span>
                        <span className="summary-label">Out of Stock</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="ok">✅ In Stock</option>
                    <option value="low">⚠️ Low Stock</option>
                    <option value="out">❌ Out of Stock</option>
                </select>
            </div>

            {/* Inventory Table */}
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Alert Level</th>
                            <th>Status</th>
                            <th>Quick Adjust</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const status = getStockStatus(item);
                            return (
                                <tr key={item.id} className={status === 'out' ? 'row-danger' : status === 'low' ? 'row-warning' : ''}>
                                    <td><strong>{item.name}</strong></td>
                                    <td className="text-muted">{item.category}</td>
                                    <td>
                                        <span className={`stock-value ${status}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="text-muted">{item.lowStockThreshold}</td>
                                    <td>
                                        <span className={`badge badge-${status === 'out' ? 'danger' : status === 'low' ? 'warning' : 'success'}`}>
                                            {status === 'out' ? '❌ Out of Stock' : status === 'low' ? '⚠️ Low Stock' : '✅ In Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="adjust-controls">
                                            <button
                                                className="btn btn-icon btn-danger"
                                                onClick={() => handleQuickAdjust(item, -1)}
                                                disabled={item.stock === 0}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setAdjustingItem(item);
                                                    setAdjustAmount('');
                                                }}
                                            >
                                                Adjust
                                            </button>
                                            <button
                                                className="btn btn-icon btn-success"
                                                onClick={() => handleQuickAdjust(item, 1)}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Adjust Modal */}
            {adjustingItem && (
                <div className="modal-overlay" onClick={() => setAdjustingItem(null)}>
                    <div className="modal adjust-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Adjust Stock: {adjustingItem.name}</h3>
                        <p className="text-muted">Current stock: {adjustingItem.stock}</p>
                        <div className="adjust-input-group">
                            <input
                                type="number"
                                className="input"
                                placeholder="Enter amount (+ or -)"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                autoFocus
                            />
                            <button className="btn btn-primary" onClick={handleCustomAdjust}>
                                Apply
                            </button>
                        </div>
                        <p className="adjust-hint">
                            Use positive number to add stock, negative to remove
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventory;

import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Search, Beer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';
import './BarItems.css';

const barCategories = [
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'beer', name: 'Beer', icon: '🍺' },
    { id: 'cocktails', name: 'Cocktails', icon: '🍸' },
];

function BarItems() {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Filter only bar items
    const barItems = menuItems.filter(item => !item.isKitchen);

    const [formData, setFormData] = useState({
        itemId: '',
        name: '',
        price: '',
        category: 'drinks',
        stock: '50',
        lowStockThreshold: '10',
    });

    const filteredItems = barItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.itemId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const generateItemId = (category) => {
        const prefix = category.toUpperCase().slice(0, 3);
        const number = String(Date.now()).slice(-4);
        return `BAR-${prefix}-${number}`;
    };

    const openAddModal = () => {
        setEditingItem(null);
        const newItemId = generateItemId('drinks');
        setFormData({
            itemId: newItemId,
            name: '',
            price: '',
            category: 'drinks',
            stock: '50',
            lowStockThreshold: '10',
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            itemId: item.itemId || `BAR-${item.id}`,
            name: item.name,
            price: item.price.toString(),
            category: item.category,
            stock: item.stock.toString(),
            lowStockThreshold: item.lowStockThreshold.toString(),
        });
        setShowModal(true);
    };

    const handleCategoryChange = (category) => {
        if (!editingItem) {
            const newItemId = generateItemId(category);
            setFormData({ ...formData, category, itemId: newItemId });
        } else {
            setFormData({ ...formData, category });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = {
            itemId: formData.itemId,
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            stock: parseInt(formData.stock),
            lowStockThreshold: parseInt(formData.lowStockThreshold),
            isKitchen: false,
        };

        if (editingItem) {
            updateMenuItem(editingItem.id, itemData);
            toast.success('Bar item updated successfully');
        } else {
            addMenuItem(itemData);
            toast.success('Bar item added successfully');
        }
        setShowModal(false);
    };

    const handleDelete = (item) => {
        if (confirm(`Delete "${item.name}"?`)) {
            deleteMenuItem(item.id);
            toast.success('Bar item deleted');
        }
    };

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="bar-items">
            <div className="page-header">
                <div className="header-title">
                    <Beer size={32} className="header-icon" />
                    <div>
                        <h1>🍺 Bar Items</h1>
                        <p>Manage drinks, beer, and cocktails</p>
                    </div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={openAddModal}>
                    <Plus size={20} />
                    Add Bar Item
                </button>
            </div>

            {/* Stats */}
            <div className="quick-stats">
                <div className="stat-pill">
                    <span className="stat-number">{barItems.length}</span>
                    <span className="stat-label">Total Items</span>
                </div>
                <div className="stat-pill warning">
                    <span className="stat-number">{barItems.filter(i => i.stock <= i.lowStockThreshold && i.stock > 0).length}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="stat-pill danger">
                    <span className="stat-number">{barItems.filter(i => i.stock === 0).length}</span>
                    <span className="stat-label">Out of Stock</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {barCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Items Table */}
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <code className="item-id">{item.itemId || `BAR-${item.id}`}</code>
                                </td>
                                <td><strong>{item.name}</strong></td>
                                <td>
                                    <span className="category-badge">
                                        {barCategories.find(c => c.id === item.category)?.icon} {item.category}
                                    </span>
                                </td>
                                <td>{formatCurrency(item.price)}</td>
                                <td>
                                    <span className={`badge ${item.stock === 0 ? 'badge-danger' :
                                            item.stock <= item.lowStockThreshold ? 'badge-warning' : 'badge-success'
                                        }`}>
                                        {item.stock} units
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn btn-icon btn-ghost" onClick={() => openEditModal(item)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn btn-icon btn-ghost text-danger" onClick={() => handleDelete(item)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredItems.length === 0 && (
                    <div className="empty-state">
                        <p>No bar items found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Bar Item' : 'Add New Bar Item'}</h2>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item ID</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.itemId}
                                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                                    placeholder="BAR-DRI-1234"
                                    required
                                />
                                <small className="form-hint">Unique identifier for this item</small>
                            </div>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter item name"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        className="select"
                                        value={formData.category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                    >
                                        {barCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Initial Stock</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Low Stock Alert</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.lowStockThreshold}
                                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={18} />
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BarItems;

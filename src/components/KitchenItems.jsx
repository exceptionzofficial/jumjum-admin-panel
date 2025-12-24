import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Search, ChefHat, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';
import './KitchenItems.css';

const kitchenCategories = [
    { id: 'food', name: 'Food', icon: '🍗' },
    { id: 'snacks', name: 'Snacks', icon: '🍟' },
];

function KitchenItems() {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, loadMenuItems, loading } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [saving, setSaving] = useState(false);

    // Filter only kitchen items
    const kitchenItems = menuItems.filter(item => item.isKitchen);

    const [formData, setFormData] = useState({
        itemId: '',
        name: '',
        price: '',
        category: 'food',
        stock: '30',
        lowStockThreshold: '8',
    });

    const filteredItems = kitchenItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.itemId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const generateItemId = (category) => {
        const prefix = category.toUpperCase().slice(0, 3);
        const number = String(Date.now()).slice(-4);
        return `KIT-${prefix}-${number}`;
    };

    const openAddModal = () => {
        setEditingItem(null);
        const newItemId = generateItemId('food');
        setFormData({
            itemId: newItemId,
            name: '',
            price: '',
            category: 'food',
            stock: '30',
            lowStockThreshold: '8',
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            itemId: item.itemId,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const itemData = {
                itemId: formData.itemId,
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                isKitchen: true,
            };

            if (editingItem) {
                await updateMenuItem(editingItem.itemId, itemData);
                toast.success('Kitchen item updated successfully');
            } else {
                await addMenuItem(itemData);
                toast.success('Kitchen item added successfully');
            }
            setShowModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (confirm(`Delete "${item.name}"?`)) {
            try {
                await deleteMenuItem(item.itemId);
                toast.success('Kitchen item deleted');
            } catch (error) {
                toast.error(error.message || 'Failed to delete item');
            }
        }
    };

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <div className="kitchen-items loading">
                <div className="loading-spinner">Loading kitchen items...</div>
            </div>
        );
    }

    return (
        <div className="kitchen-items">
            <div className="page-header">
                <div className="header-title">
                    <ChefHat size={32} className="header-icon" />
                    <div>
                        <h1>🍳 Kitchen Items</h1>
                        <p>Manage food and snacks prepared in kitchen</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={loadMenuItems}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={openAddModal}>
                        <Plus size={20} />
                        Add Kitchen Item
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="quick-stats">
                <div className="stat-pill">
                    <span className="stat-number">{kitchenItems.length}</span>
                    <span className="stat-label">Total Items</span>
                </div>
                <div className="stat-pill warning">
                    <span className="stat-number">{kitchenItems.filter(i => i.stock <= i.lowStockThreshold && i.stock > 0).length}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="stat-pill danger">
                    <span className="stat-number">{kitchenItems.filter(i => i.stock === 0).length}</span>
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
                    {kitchenCategories.map(cat => (
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
                            <tr key={item.itemId}>
                                <td>
                                    <code className="item-id kitchen">{item.itemId}</code>
                                </td>
                                <td><strong>{item.name}</strong></td>
                                <td>
                                    <span className="category-badge">
                                        {kitchenCategories.find(c => c.id === item.category)?.icon} {item.category}
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
                        <p>No kitchen items found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header kitchen">
                            <h2>{editingItem ? 'Edit Kitchen Item' : 'Add New Kitchen Item'}</h2>
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
                                    placeholder="KIT-FOO-1234"
                                    required
                                    disabled={editingItem}
                                />
                                <small className="form-hint">Unique identifier for this kitchen item</small>
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
                                        {kitchenCategories.map(cat => (
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
                                <button type="submit" className="btn btn-success" disabled={saving}>
                                    <Check size={18} />
                                    {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KitchenItems;

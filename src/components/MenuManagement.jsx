import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useData } from '../context/DataContext';
import './MenuManagement.css';

const categories = [
    { id: 'scotch', name: 'Scotch Whisky', icon: '🥃' },
    { id: 'whisky', name: 'Whisky', icon: '🥃' },
    { id: 'brandy', name: 'Brandy', icon: '🍷' },
    { id: 'vodka', name: 'Vodka', icon: '🍸' },
    { id: 'rum', name: 'Rum', icon: '🍹' },
    { id: 'gin', name: 'Gin', icon: '🍸' },
    { id: 'wine', name: 'Wine', icon: '🍷' },
    { id: 'beer', name: 'Beer', icon: '🍺' },
    { id: 'drinks', name: 'Other Drinks', icon: '🥤' },
    { id: 'cocktails', name: 'Cocktails', icon: '🍹' },
    { id: 'food', name: 'Food', icon: '🍗' },
    { id: 'snacks', name: 'Snacks', icon: '🍟' },
];

function MenuManagement() {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'drinks',
        stock: '',
        lowStockThreshold: '',
        isKitchen: false,
    });

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            price: '',
            category: 'drinks',
            stock: '50',
            lowStockThreshold: '10',
            isKitchen: false,
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price.toString(),
            category: item.category,
            stock: item.stock.toString(),
            lowStockThreshold: item.lowStockThreshold.toString(),
            isKitchen: item.isKitchen,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = {
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            stock: parseInt(formData.stock),
            lowStockThreshold: parseInt(formData.lowStockThreshold),
            isKitchen: formData.isKitchen,
        };

        if (editingItem) {
            updateMenuItem(editingItem.id, itemData);
            toast.success('Item updated successfully');
        } else {
            addMenuItem(itemData);
            toast.success('Item added successfully');
        }
        setShowModal(false);
    };

    const handleDelete = (item) => {
        if (confirm(`Delete "${item.name}"?`)) {
            deleteMenuItem(item.id);
            toast.success('Item deleted');
        }
    };

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="menu-management">
            <div className="page-header">
                <div>
                    <h1>🍽️ Menu Items</h1>
                    <p>Manage your menu items and prices</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={openAddModal}>
                    <Plus size={20} />
                    Add Item
                </button>
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
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Items Table */}
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <strong>{item.name}</strong>
                                </td>
                                <td>
                                    <span className="category-badge">
                                        {categories.find(c => c.id === item.category)?.icon} {item.category}
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
                                    <span className={`type-badge ${item.isKitchen ? 'kitchen' : 'bar'}`}>
                                        {item.isKitchen ? '🍳 Kitchen' : '🍺 Bar'}
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        className="select"
                                        value={formData.category}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            category: e.target.value,
                                            isKitchen: ['food', 'snacks'].includes(e.target.value)
                                        })}
                                    >
                                        {categories.map(cat => (
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
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isKitchen}
                                        onChange={(e) => setFormData({ ...formData, isKitchen: e.target.checked })}
                                    />
                                    Kitchen Item (prepared in kitchen)
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={18} />
                                    {editingItem ? 'Update' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MenuManagement;

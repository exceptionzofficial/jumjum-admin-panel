import {
    LayoutDashboard,
    Beer,
    ChefHat,
    Package,
    Receipt,
    Bell,
    FileText,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import './Sidebar.css';

function Sidebar({ activePage, onPageChange }) {
    const { theme, toggleTheme } = useTheme();
    const { getStats } = useData();
    const stats = getStats();

    const alertCount = stats.outOfStockItems.length + stats.lowStockItems.length;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bar', label: 'Bar Items', icon: Beer },
        { id: 'kitchen', label: 'Kitchen Items', icon: ChefHat },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'orders', label: 'Orders', icon: Receipt },
        { id: 'reports', label: 'Billing Reports', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: alertCount },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">🍺</div>
                <div className="sidebar-title">
                    <h1>JumJum</h1>
                    <span>Admin Panel</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onPageChange(item.id)}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                        {item.badge > 0 && (
                            <span className="nav-badge">{item.badge}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;

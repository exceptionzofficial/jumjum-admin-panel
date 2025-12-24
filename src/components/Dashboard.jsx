import {
    TrendingUp,
    ShoppingCart,
    Package,
    AlertTriangle,
    IndianRupee,
    Users
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Dashboard.css';

function Dashboard() {
    const { orders, menuItems, getStats } = useData();
    const stats = getStats();

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    // Generate chart data from orders
    const getRevenueData = () => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const dayOrders = orders.filter(o =>
                new Date(o.timestamp).toDateString() === dateStr
            );
            const dayRevenue = dayOrders.reduce((sum, o) =>
                sum + (o.cart?.reduce((t, item) => t + (item.price * item.quantity), 0) || 0), 0
            );

            last7Days.push({
                day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
                revenue: dayRevenue,
                orders: dayOrders.length,
            });
        }
        return last7Days;
    };

    // Top selling items
    const getTopItems = () => {
        const itemSales = {};
        orders.forEach(order => {
            order.cart?.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
                }
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.price * item.quantity;
            });
        });
        return Object.values(itemSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    };

    const revenueData = getRevenueData();
    const topItems = getTopItems();

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p>Overview of your bar operations</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <IndianRupee size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Today's Revenue</span>
                        <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orders">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Today's Orders</span>
                        <span className="stat-value">{stats.todayOrders}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon total">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon avg">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Avg Order Value</span>
                        <span className="stat-value">{formatCurrency(stats.avgOrderValue)}</span>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {(stats.outOfStockItems.length > 0 || stats.lowStockItems.length > 0) && (
                <div className="alerts-section">
                    {stats.outOfStockItems.length > 0 && (
                        <div className="alert alert-danger">
                            <AlertTriangle size={20} />
                            <span>
                                <strong>{stats.outOfStockItems.length} items out of stock:</strong>{' '}
                                {stats.outOfStockItems.map(i => i.name).join(', ')}
                            </span>
                        </div>
                    )}
                    {stats.lowStockItems.length > 0 && (
                        <div className="alert alert-warning">
                            <Package size={20} />
                            <span>
                                <strong>{stats.lowStockItems.length} items low on stock:</strong>{' '}
                                {stats.lowStockItems.map(i => i.name).join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>📈 Revenue (Last 7 Days)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-hover)" />
                                <XAxis dataKey="day" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--bg-hover)',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>🏆 Top Selling Items</h3>
                    <div className="chart-container">
                        {topItems.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={topItems} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-hover)" />
                                    <XAxis type="number" stroke="var(--text-muted)" />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="var(--text-muted)"
                                        width={100}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--bg-hover)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">No sales data yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

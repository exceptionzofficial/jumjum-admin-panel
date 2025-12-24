import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { menuApi, billingApi } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load menu items from API
    const loadMenuItems = useCallback(async () => {
        try {
            const items = await menuApi.getAll();
            setMenuItems(items);
            setError(null);
        } catch (err) {
            console.error('Failed to load menu items:', err);
            setError(err.message);
        }
    }, []);

    // Load orders from API
    const loadOrders = useCallback(async () => {
        try {
            const bills = await billingApi.getAll();
            setOrders(bills);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([loadMenuItems(), loadOrders()]);
            setLoading(false);
        };
        init();
    }, [loadMenuItems, loadOrders]);

    // Menu operations
    const addMenuItem = async (item) => {
        try {
            const newItem = await menuApi.create(item);
            setMenuItems(prev => [...prev, newItem]);
            return newItem;
        } catch (err) {
            throw err;
        }
    };

    const updateMenuItem = async (itemId, updates) => {
        try {
            const updated = await menuApi.update(itemId, updates);
            setMenuItems(prev => prev.map(item =>
                item.itemId === itemId ? updated : item
            ));
            return updated;
        } catch (err) {
            throw err;
        }
    };

    const deleteMenuItem = async (itemId) => {
        try {
            await menuApi.delete(itemId);
            setMenuItems(prev => prev.filter(item => item.itemId !== itemId));
        } catch (err) {
            throw err;
        }
    };

    const updateStock = async (itemId, quantity) => {
        try {
            const updated = await menuApi.updateStock(itemId, quantity);
            setMenuItems(prev => prev.map(item =>
                item.itemId === itemId ? updated : item
            ));
            return updated;
        } catch (err) {
            throw err;
        }
    };

    // Analytics
    const getStats = useCallback(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;

        const today = new Date().toDateString();
        const todayOrders = orders.filter(o =>
            new Date(o.createdAt).toDateString() === today
        );
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        const lowStockItems = menuItems.filter(item =>
            item.stock <= item.lowStockThreshold && item.stock > 0
        );
        const outOfStockItems = menuItems.filter(item => item.stock === 0);

        return {
            totalRevenue,
            totalOrders,
            todayOrders: todayOrders.length,
            todayRevenue,
            lowStockItems,
            outOfStockItems,
            avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        };
    }, [orders, menuItems]);

    return (
        <DataContext.Provider value={{
            menuItems,
            orders,
            loading,
            error,
            addMenuItem,
            updateMenuItem,
            deleteMenuItem,
            updateStock,
            getStats,
            loadMenuItems,
            loadOrders,
            refresh: () => Promise.all([loadMenuItems(), loadOrders()]),
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
}

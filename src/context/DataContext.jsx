import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext();

// Default menu items with inventory
const defaultMenuItems = [
    { id: 1, name: 'Mineral Water', price: 30, category: 'drinks', stock: 100, lowStockThreshold: 20, isKitchen: false },
    { id: 2, name: 'Soda', price: 40, category: 'drinks', stock: 80, lowStockThreshold: 15, isKitchen: false },
    { id: 3, name: 'Fresh Lime', price: 60, category: 'drinks', stock: 50, lowStockThreshold: 10, isKitchen: false },
    { id: 4, name: 'Cold Coffee', price: 80, category: 'drinks', stock: 40, lowStockThreshold: 10, isKitchen: false },
    { id: 5, name: 'Mango Juice', price: 70, category: 'drinks', stock: 35, lowStockThreshold: 10, isKitchen: false },
    { id: 6, name: 'Kingfisher', price: 180, category: 'beer', stock: 60, lowStockThreshold: 20, isKitchen: false },
    { id: 7, name: 'Budweiser', price: 220, category: 'beer', stock: 45, lowStockThreshold: 15, isKitchen: false },
    { id: 8, name: 'Corona', price: 280, category: 'beer', stock: 30, lowStockThreshold: 10, isKitchen: false },
    { id: 9, name: 'Heineken', price: 250, category: 'beer', stock: 25, lowStockThreshold: 10, isKitchen: false },
    { id: 10, name: 'Carlsberg', price: 200, category: 'beer', stock: 40, lowStockThreshold: 15, isKitchen: false },
    { id: 11, name: 'Mojito', price: 350, category: 'cocktails', stock: 20, lowStockThreshold: 5, isKitchen: false },
    { id: 12, name: 'Margarita', price: 380, category: 'cocktails', stock: 15, lowStockThreshold: 5, isKitchen: false },
    { id: 13, name: 'Long Island', price: 450, category: 'cocktails', stock: 12, lowStockThreshold: 5, isKitchen: false },
    { id: 14, name: 'Cosmopolitan', price: 400, category: 'cocktails', stock: 10, lowStockThreshold: 5, isKitchen: false },
    { id: 15, name: 'Pina Colada', price: 380, category: 'cocktails', stock: 8, lowStockThreshold: 5, isKitchen: false },
    { id: 16, name: 'Chicken 65', price: 280, category: 'food', stock: 25, lowStockThreshold: 8, isKitchen: true },
    { id: 17, name: 'Gobi Manchurian', price: 220, category: 'food', stock: 20, lowStockThreshold: 8, isKitchen: true },
    { id: 18, name: 'Paneer Tikka', price: 260, category: 'food', stock: 18, lowStockThreshold: 5, isKitchen: true },
    { id: 19, name: 'Tandoori Chicken', price: 350, category: 'food', stock: 15, lowStockThreshold: 5, isKitchen: true },
    { id: 20, name: 'Fish Fry', price: 320, category: 'food', stock: 12, lowStockThreshold: 5, isKitchen: true },
    { id: 21, name: 'Mutton Seekh', price: 380, category: 'food', stock: 10, lowStockThreshold: 5, isKitchen: true },
    { id: 22, name: 'Chilli Chicken', price: 290, category: 'food', stock: 20, lowStockThreshold: 8, isKitchen: true },
    { id: 23, name: 'Mushroom Fry', price: 240, category: 'food', stock: 15, lowStockThreshold: 5, isKitchen: true },
    { id: 24, name: 'French Fries', price: 150, category: 'snacks', stock: 40, lowStockThreshold: 15, isKitchen: true },
    { id: 25, name: 'Onion Rings', price: 160, category: 'snacks', stock: 35, lowStockThreshold: 10, isKitchen: true },
    { id: 26, name: 'Masala Papad', price: 80, category: 'snacks', stock: 50, lowStockThreshold: 20, isKitchen: true },
    { id: 27, name: 'Peanut Masala', price: 120, category: 'snacks', stock: 45, lowStockThreshold: 15, isKitchen: true },
    { id: 28, name: 'Cheese Balls', price: 180, category: 'snacks', stock: 30, lowStockThreshold: 10, isKitchen: true },
    { id: 29, name: 'Spring Roll', price: 200, category: 'snacks', stock: 25, lowStockThreshold: 8, isKitchen: true },
    { id: 30, name: 'Veg Pakora', price: 140, category: 'snacks', stock: 35, lowStockThreshold: 10, isKitchen: true },
];

export function DataProvider({ children }) {
    const [menuItems, setMenuItems] = useState(() => {
        const saved = localStorage.getItem('jumjum_menu_items');
        return saved ? JSON.parse(saved) : defaultMenuItems;
    });

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('jumjum_orders');
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('jumjum_menu_items', JSON.stringify(menuItems));
    }, [menuItems]);

    // Load orders periodically
    const loadOrders = useCallback(() => {
        const saved = localStorage.getItem('jumjum_orders');
        if (saved) setOrders(JSON.parse(saved));
    }, []);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 5000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    // Menu operations
    const addMenuItem = (item) => {
        const newItem = { ...item, id: Date.now() };
        setMenuItems(prev => [...prev, newItem]);
        return newItem;
    };

    const updateMenuItem = (id, updates) => {
        setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteMenuItem = (id) => {
        setMenuItems(prev => prev.filter(item => item.id !== id));
    };

    const updateStock = (id, quantity) => {
        setMenuItems(prev => prev.map(item =>
            item.id === id ? { ...item, stock: Math.max(0, item.stock + quantity) } : item
        ));
    };

    // Analytics
    const getStats = useCallback(() => {
        const totalRevenue = orders.reduce((sum, order) => {
            const orderTotal = order.cart?.reduce((t, item) => t + (item.price * item.quantity), 0) || 0;
            return sum + orderTotal;
        }, 0);

        const totalOrders = orders.length;
        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.timestamp).toDateString();
            return orderDate === new Date().toDateString();
        });
        const todayRevenue = todayOrders.reduce((sum, order) => {
            const orderTotal = order.cart?.reduce((t, item) => t + (item.price * item.quantity), 0) || 0;
            return sum + orderTotal;
        }, 0);

        const lowStockItems = menuItems.filter(item => item.stock <= item.lowStockThreshold && item.stock > 0);
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
            addMenuItem,
            updateMenuItem,
            deleteMenuItem,
            updateStock,
            getStats,
            loadOrders,
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

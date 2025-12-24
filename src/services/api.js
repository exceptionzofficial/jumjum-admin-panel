// API Service for JumJum Admin Panel
const API_BASE_URL = 'https://jumjum-backend.vercel.app/api';

// Menu Items API
export const menuApi = {
    // Get all menu items
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/menu-items`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get bar items only
    getBarItems: async () => {
        const response = await fetch(`${API_BASE_URL}/menu-items/bar`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get kitchen items only
    getKitchenItems: async () => {
        const response = await fetch(`${API_BASE_URL}/menu-items/kitchen`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get low stock items
    getLowStock: async () => {
        const response = await fetch(`${API_BASE_URL}/menu-items/low-stock`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Create new item
    create: async (item) => {
        const response = await fetch(`${API_BASE_URL}/menu-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Update item
    update: async (itemId, updates) => {
        const response = await fetch(`${API_BASE_URL}/menu-items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Update stock
    updateStock: async (itemId, quantity) => {
        const response = await fetch(`${API_BASE_URL}/menu-items/${itemId}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Delete item
    delete: async (itemId) => {
        const response = await fetch(`${API_BASE_URL}/menu-items/${itemId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },
};

// Billing API
export const billingApi = {
    // Get all bills
    getAll: async (limit = 100) => {
        const response = await fetch(`${API_BASE_URL}/billing?limit=${limit}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get today's bills
    getToday: async () => {
        const response = await fetch(`${API_BASE_URL}/billing/today`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get stats
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/billing/stats`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Create bill
    create: async (billData) => {
        const response = await fetch(`${API_BASE_URL}/billing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data;
    },
};

export default { menuApi, billingApi };

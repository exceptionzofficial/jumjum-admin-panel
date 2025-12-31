import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BarItems from './components/BarItems';
import KitchenItems from './components/KitchenItems';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import BillingReports from './components/BillingReports';
import KitchenStock from './components/KitchenStock';
import Notifications from './components/Notifications';
import './App.css';

function AdminApp() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'bar':
        return <BarItems />;
      case 'kitchen':
        return <KitchenItems />;
      case 'inventory':
        return <Inventory />;
      case 'orders':
        return <Orders />;
      case 'reports':
        return <BillingReports />;
      case 'kitchenstock':
        return <KitchenStock />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Toaster position="top-right" />
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AdminApp />
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

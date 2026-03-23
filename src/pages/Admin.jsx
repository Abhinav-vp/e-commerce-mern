import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import AdminProducts from '../components/AdminPanel/AdminProducts';
import AdminUsers from '../components/AdminPanel/AdminUsers';
import AdminOrders from '../components/AdminPanel/AdminOrders';
import '../components/AdminPanel/AdminPanel.css';

const Admin = () => {
  const { all_product } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('products');
  const [isAdmin, setIsAdmin] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
  const token = localStorage.getItem('auth-token');

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        if (!token) {
          window.location.replace('/login');
          return;
        }
        
        // Verify admin can access this by trying to fetch products
        const response = await fetch(`${apiBase}/api/admin/products`, {
          headers: { 'auth-token': token },
        });

        if (response.status === 403) {
          alert('You do not have admin access');
          window.location.replace('/');
        } else if (response.ok) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [token, apiBase]);

  if (!isAdmin && token) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p className="welcome-text">Manage products, users, and orders</p>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button
              className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            <button
              className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 Orders
            </button>
          </nav>

          <div className="admin-stats">
            <h3>Stats</h3>
            <div className="stat-item">
              <span>Total Products</span>
              <strong>{all_product.length}</strong>
            </div>
          </div>

          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem('auth-token');
              window.location.replace('/');
            }}
          >
            Logout
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'products' && <AdminProducts apiBase={apiBase} />}
          {activeTab === 'users' && <AdminUsers apiBase={apiBase} />}
          {activeTab === 'orders' && <AdminOrders apiBase={apiBase} />}
        </div>
      </div>
    </div>
  );
};

export default Admin;

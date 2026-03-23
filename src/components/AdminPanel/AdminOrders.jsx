import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminOrders.css';

const AdminOrders = ({ apiBase }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('auth-token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/api/admin/orders`, {
        headers: { 'auth-token': token },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${apiBase}/api/admin/orders/${orderId}`,
        { status: newStatus },
        { headers: { 'auth-token': token } }
      );
      alert('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'processing':
        return '#2196f3';
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  return (
    <div className="admin-orders">
      <h2>Manage Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userId}</td>
                  <td>₹{order.totalAmount}</td>
                  <td style={{ color: getStatusColor(order.status) }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <select
                      className="status-select"
                      defaultValue={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <p className="no-orders">No orders found</p>
      )}
    </div>
  );
};

export default AdminOrders;

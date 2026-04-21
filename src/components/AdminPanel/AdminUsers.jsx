import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../../context/ModalContext';
import './AdminUsers.css';

const AdminUsers = ({ apiBase }) => {
  const { showModal } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('auth-token');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/api/admin/users`, {
        headers: { 'auth-token': token },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      showModal({ title: 'Error', message: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, showModal]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleMakeAdmin = async (userId) => {
    try {
      await axios.put(
        `${apiBase}/api/admin/users/${userId}/role`,
        { isAdmin: true },
        { headers: { 'auth-token': token } }
      );
      showModal({ title: 'Success', message: 'User promoted to admin' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showModal({ title: 'Error', message: 'Failed to update user role' });
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      await axios.put(
        `${apiBase}/api/admin/users/${userId}/role`,
        { isAdmin: false },
        { headers: { 'auth-token': token } }
      );
      showModal({ title: 'Success', message: 'Admin privileges removed' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showModal({ title: 'Error', message: 'Failed to update user role' });
    }
  };

  const handleDeleteUser = async (userId) => {
    showModal({
      type: 'confirm',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        try {
          await axios.delete(`${apiBase}/api/admin/users/${userId}`, {
            headers: { 'auth-token': token },
          });
          showModal({ title: 'Success', message: 'User deleted successfully' });
          fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          showModal({ title: 'Error', message: 'Failed to delete user' });
        }
      }
    });
  };

  return (
    <div className="admin-users">
      <h2>Manage Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.date).toLocaleDateString()}</td>
                  <td className={user.isAdmin ? 'admin' : 'customer'}>
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </td>
                  <td className="actions">
                    {user.isAdmin ? (
                      <button
                        className="btn-remove-admin"
                        onClick={() => handleRemoveAdmin(user._id)}
                      >
                        Remove Admin
                      </button>
                    ) : (
                      <button
                        className="btn-make-admin"
                        onClick={() => handleMakeAdmin(user._id)}
                      >
                        Make Admin
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

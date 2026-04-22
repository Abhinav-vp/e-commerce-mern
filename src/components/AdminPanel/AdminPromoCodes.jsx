import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../../context/ModalContext';
import './AdminPromoCodes.css';

const AdminPromoCodes = ({ apiBase }) => {
  const { showModal } = useModal();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
  });

  const token = localStorage.getItem('auth-token');

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/api/promo/admin/all`, {
        headers: { 'auth-token': token },
      });
      setPromos(response.data.promos);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      showModal({ title: 'Error', message: 'Failed to fetch promo codes' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, showModal]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxUses: '',
      expiresAt: '',
    });
    setEditingPromo(null);
    setShowForm(false);
  };

  const handleEditClick = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount || '',
      maxUses: promo.maxUses || '',
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
      maxUses: formData.maxUses ? Number(formData.maxUses) : 0,
      expiresAt: formData.expiresAt || null,
    };

    try {
      if (editingPromo) {
        await axios.put(`${apiBase}/api/promo/admin/${editingPromo._id}`, payload, {
          headers: { 'auth-token': token },
        });
        showModal({ title: 'Success', message: 'Promo code updated successfully' });
      } else {
        await axios.post(`${apiBase}/api/promo/admin/create`, payload, {
          headers: { 'auth-token': token },
        });
        showModal({ title: 'Success', message: 'Promo code created successfully' });
      }
      resetForm();
      fetchPromos();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to save promo code';
      showModal({ title: 'Error', message: msg });
    }
  };

  const handleDelete = async (id) => {
    showModal({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this promo code?',
      onConfirm: async () => {
        try {
          await axios.delete(`${apiBase}/api/promo/admin/${id}`, {
            headers: { 'auth-token': token },
          });
          showModal({ title: 'Success', message: 'Promo code deleted' });
          fetchPromos();
        } catch (error) {
          showModal({ title: 'Error', message: 'Failed to delete promo code' });
        }
      },
    });
  };

  const handleToggleActive = async (promo) => {
    try {
      await axios.put(
        `${apiBase}/api/promo/admin/${promo._id}`,
        { isActive: !promo.isActive },
        { headers: { 'auth-token': token } }
      );
      fetchPromos();
    } catch (error) {
      showModal({ title: 'Error', message: 'Failed to update promo code' });
    }
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="admin-promos">
      <div className="promos-header">
        <h2>Promo Codes</h2>
        <button className="btn-create" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Cancel' : '+ Create Promo Code'}
        </button>
      </div>

      {showForm && (
        <div className="promo-form-card">
          <h3>{editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}</h3>
          <form onSubmit={handleSubmit} className="promo-form">
            <div className="form-row">
              <div className="form-group">
                <label>Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 10'}
                  min="0"
                  step="any"
                  required
                />
              </div>
              <div className="form-group">
                <label>Min. Order Amount ($)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="0 = no minimum"
                  min="0"
                  step="any"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Max Uses</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="0 = unlimited"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Expires At</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-save">
              {editingPromo ? 'Update Promo Code' : 'Create Promo Code'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading promo codes...</p>
      ) : promos.length === 0 ? (
        <p className="no-promos">No promo codes yet. Create one to get started!</p>
      ) : (
        <div className="promos-table">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo._id} className={!promo.isActive ? 'inactive-row' : ''}>
                  <td className="code-cell">{promo.code}</td>
                  <td>
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}%`
                      : `$${promo.discountValue}`}
                  </td>
                  <td>{promo.minOrderAmount > 0 ? `$${promo.minOrderAmount}` : '—'}</td>
                  <td>
                    {promo.usedCount}
                    {promo.maxUses > 0 ? ` / ${promo.maxUses}` : ' / ∞'}
                  </td>
                  <td className={isExpired(promo.expiresAt) ? 'expired-text' : ''}>
                    {promo.expiresAt
                      ? new Date(promo.expiresAt).toLocaleDateString()
                      : 'Never'}
                    {isExpired(promo.expiresAt) && <span className="expired-badge">Expired</span>}
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${promo.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(promo)}
                    >
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEditClick(promo)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(promo._id)}>Delete</button>
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

export default AdminPromoCodes;

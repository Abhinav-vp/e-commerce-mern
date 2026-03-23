import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminProducts.css';

const AdminProducts = ({ apiBase }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'women',
    image: '',
    new_price: '',
    old_price: '',
  });

  const token = localStorage.getItem('auth-token');

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/api/admin/products`, {
        headers: { 'auth-token': token },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (!formData.id || !formData.name || !formData.image || !formData.new_price || !formData.old_price) {
        alert('All fields are required');
        return;
      }

      await axios.post(`${apiBase}/api/admin/products/add`, formData, {
        headers: { 'auth-token': token },
      });

      alert('Product added successfully');
      setFormData({
        id: '',
        name: '',
        category: 'women',
        image: '',
        new_price: '',
        old_price: '',
      });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.error || 'Failed to add product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBase}/api/admin/products/${editingId}`, formData, {
        headers: { 'auth-token': token },
      });

      alert('Product updated successfully');
      setEditingId(null);
      setFormData({
        id: '',
        name: '',
        category: 'women',
        image: '',
        new_price: '',
        old_price: '',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${apiBase}/api/admin/products/${productId}`, {
          headers: { 'auth-token': token },
        });
        alert('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      new_price: product.new_price,
      old_price: product.old_price,
    });
    setShowForm(true);
  };

  return (
    <div className="admin-products">
      <h2>Manage Products</h2>

      <button
        className="btn-add-product"
        onClick={() => {
          setEditingId(null);
          setFormData({
            id: '',
            name: '',
            category: 'women',
            image: '',
            new_price: '',
            old_price: '',
          });
          setShowForm(!showForm);
        }}
      >
        {showForm ? 'Cancel' : '+ Add New Product'}
      </button>

      {showForm && (
        <form className="product-form" onSubmit={editingId ? handleEditProduct : handleAddProduct}>
          <div className="form-group">
            <label>Product ID</label>
            <input
              type="number"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              disabled={editingId !== null}
              required
            />
          </div>

          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange}>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kid">Kids</option>
            </select>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.png"
              required
            />
          </div>

          <div className="form-group">
            <label>New Price</label>
            <input
              type="number"
              name="new_price"
              value={formData.new_price}
              onChange={handleInputChange}
              step="0.01"
              placeholder="Enter new price"
              required
            />
          </div>

          <div className="form-group">
            <label>Old Price</label>
            <input
              type="number"
              name="old_price"
              value={formData.old_price}
              onChange={handleInputChange}
              step="0.01"
              placeholder="Enter old price"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>New Price</th>
                <th>Old Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.new_price}</td>
                  <td>₹{product.old_price}</td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteProduct(product.id)}
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

export default AdminProducts;

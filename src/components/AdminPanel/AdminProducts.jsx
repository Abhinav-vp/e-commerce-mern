import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../../context/ModalContext';
import ImageCropper from './ImageCropper';
import './AdminProducts.css';

const AdminProducts = ({ apiBase }) => {
  const { showModal } = useModal();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'women',
    image: '',
    sub_images: ['', '', '', ''],
    new_price: '',
    old_price: '',
  });
  const [dragging, setDragging] = useState(null); // -1 for main, 0-3 for sub
  const [uploading, setUploading] = useState(null); // index or 'main'
  const [imageToCrop, setImageToCrop] = useState(null);
  
  const getImageUrl = useCallback((url) => {
    if (!url) return "";
    // If it's a localhost URL but we are in production, swap it for the apiBase
    if (url.includes("localhost:7000") || url.includes("localhost:4000")) {
        return url.replace(/http:\/\/localhost:(7000|4000)/, apiBase);
    }
    if (url.startsWith("http")) return url;
    const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  }, [apiBase]);

  const token = localStorage.getItem('auth-token');

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/api/admin/products`, {
        headers: { 'auth-token': token },
      });
      // Normalize images and thumbnails
      const normalized = response.data.products.map(product => ({
        ...product,
        image: getImageUrl(product.image),
        sub_images: (product.sub_images || []).map(url => getImageUrl(url)),
        thumbnail: getImageUrl(product.thumbnail),
        sub_thumbnails: (product.sub_thumbnails || []).map(url => getImageUrl(url)),
      }));
      setProducts(normalized);
    } catch (error) {
      console.error('Error fetching products:', error);
      showModal({ title: 'Error', message: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, showModal]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (file, index = -1) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showModal({ title: 'Invalid File', message: 'Please upload a valid image file (JPEG, PNG, or WebP)' });
      return;
    }

    setUploading(index === -1 ? 'main' : index);
    const data = new FormData();
    data.append("product", file);

    try {
      const res = await axios.post(`${apiBase}/upload`, data);

      if (res.data.success) {
        const fullUrl = getImageUrl(res.data.image_url);
        const thumbUrl = getImageUrl(res.data.thumbnail_url);
        console.log("📸 Image uploaded. Main:", fullUrl, "Thumb:", thumbUrl);
        
        if (index === -1) {
          setFormData((prev) => ({
            ...prev,
            image: res.data.image_url,
            thumbnail: res.data.thumbnail_url,
          }));
        } else {
          setFormData((prev) => {
            const nextSubImages = [...prev.sub_images];
            const nextSubThumbs = [...(prev.sub_thumbnails || [])];
            nextSubImages[index] = res.data.image_url;
            nextSubThumbs[index] = res.data.thumbnail_url;
            return { ...prev, sub_images: nextSubImages, sub_thumbnails: nextSubThumbs };
          });
        }
      } else {
        showModal({ title: 'Upload Failed', message: "Image upload failed: " + (res.data.message || "Unknown error") });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      const errorMsg = error.response?.data?.message || "Image upload failed. Please check your connection and try again.";
      showModal({ title: 'Upload Error', message: errorMsg });
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageToCrop({ data: reader.result, index });
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(null);
  };

  const handleFileChange = (e, index) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageToCrop({ data: reader.result, index });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    const index = imageToCrop?.index ?? -1;
    setImageToCrop(null);
    const croppedFile = new File([croppedBlob], "cropped_image.jpg", { type: "image/jpeg" });
    handleImageUpload(croppedFile, index);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name) {
        showModal({ title: 'Missing Field', message: 'Product Name is required' });
        return;
      }
      if (!formData.image) {
        showModal({ title: 'Missing Image', message: 'Main Image is required. Please upload an image.' });
        return;
      }
      if (!formData.new_price) {
        showModal({ title: 'Missing Price', message: 'New Price is required' });
        return;
      }
      if (!formData.old_price) {
        showModal({ title: 'Missing Price', message: 'Old Price is required' });
        return;
      }

      const newPriceValue = parseFloat(formData.new_price);
      const oldPriceValue = parseFloat(formData.old_price);

      if (newPriceValue <= 0 || oldPriceValue <= 0) {
        showModal({ title: 'Invalid Prices', message: "Prices must be greater than zero" });
        return;
      }

      if (newPriceValue > oldPriceValue) {
        showModal({ title: 'Pricing Error', message: "New Price cannot be higher than Old Price" });
        return;
      }

      await axios.post(`${apiBase}/api/admin/products/add`, formData, {
        headers: { 'auth-token': token },
      });

      showModal({ title: 'Success', message: 'Product added successfully' });
      setFormData({
        id: '',
        name: '',
        category: 'women',
        image: '',
        sub_images: ['', '', '', ''],
        new_price: '',
        old_price: '',
      });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      showModal({ title: 'Error', message: error.response?.data?.error || 'Failed to add product' });
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const newPriceValue = parseFloat(formData.new_price);
      const oldPriceValue = parseFloat(formData.old_price);

      if (newPriceValue <= 0 || oldPriceValue <= 0) {
        showModal({ title: 'Invalid Prices', message: "Prices must be greater than zero" });
        return;
      }

      if (newPriceValue > oldPriceValue) {
        showModal({ title: 'Pricing Error', message: "New Price cannot be higher than Old Price" });
        return;
      }

      await axios.put(`${apiBase}/api/admin/products/${editingId}`, formData, {
        headers: { 'auth-token': token },
      });

      showModal({ title: 'Success', message: 'Product updated successfully' });
      setEditingId(null);
      setFormData({
        id: '',
        name: '',
        category: 'women',
        image: '',
        sub_images: ['', '', '', ''],
        new_price: '',
        old_price: '',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      showModal({ title: 'Error', message: 'Failed to update product' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    showModal({
      type: 'confirm',
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      onConfirm: async () => {
        try {
          await axios.delete(`${apiBase}/api/admin/products/${productId}`, {
            headers: { 'auth-token': token },
          });
          showModal({ title: 'Success', message: 'Product deleted successfully' });
          fetchProducts();
        } catch (error) {
          console.error('Error deleting product:', error);
          showModal({ title: 'Error', message: 'Failed to delete product' });
        }
      }
    });
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      sub_images: Array.from({ length: 4 }, (_, i) => (product.sub_images && product.sub_images[i]) || ''),
      new_price: product.new_price,
      old_price: product.old_price,
    });
    setShowForm(true);
  };

  return (
    <div className="admin-products">
      <h2>Manage Products</h2>
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop.data || imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}

      <button
        className="btn-add-product"
        onClick={() => {
          setEditingId(null);
          setFormData({
            id: '',
            name: '',
            category: 'women',
            image: '',
            sub_images: ['', '', '', ''],
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
              type="text"
              name="id"
              value={editingId !== null ? formData.id : "(Auto-generated)"}
              disabled={true}
              style={{ background: '#eee', color: '#666' }}
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
            <label>Upload Cover Image</label>
            <div
              className={`upload-box ${dragging === -1 ? 'dragging' : ''}`}
              onDrop={(e) => handleDrop(e, -1)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, -1)}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("fileInput").click()}
            >
              {formData.image ? (
                <img 
                  src={getImageUrl(formData.image)} 
                  alt="preview" 
                  className="preview-img" 
                  onError={(e) => {
                    if (e.target.src.includes('rawpixel.com')) {
                      e.target.onerror = null;
                      return;
                    }
                    const currentSrc = e.target.src;
                    if (currentSrc.includes('/thumbnails/') && !currentSrc.includes('s3.amazonaws.com')) {
                      e.target.src = currentSrc.replace('/thumbnails/', '/images/').replace('thumb_', '');
                    } else {
                      e.target.src = 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvczg0LXRlZC0xNTg3OWEucG5n.png';
                      e.target.onerror = null;
                    }
                  }}
                />
              ) : (uploading === 'main' || uploading === true) ? (
                <div className="upload-loading"><div className="spinner"></div><p>Uploading...</p></div>
              ) : (
                <p>Drag & Drop Main Image or Click</p>
              )}
 
              <input
                type="file"
                id="fileInput"
                onChange={(e) => handleFileChange(e, -1)}
                hidden
              />
              <label htmlFor="fileInput" className="upload-btn">Choose File</label>
            </div>
          </div>
 
          <div className="form-group">
            <label>Sub Images (Max 4 Angles)</label>
            <div className="sub-images-upload-container">
              {[0,1,2,3 ].map((index) => (
                <div 
                  key={index}
                  className={`upload-box sub-upload ${dragging === index ? 'dragging' : ''}`}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById(`subFileInput-${index}`).click()}
                >
                  {formData.sub_images[index] && formData.sub_images[index].length > 1 ? (
                    <>
                      <img 
                        src={formData.sub_images[index]} 
                        alt={`sub-${index}`} 
                        className="preview-img" 
                        onError={(e) => {
                          if (e.target.src.includes('/thumbnails/')) {
                            e.target.src = e.target.src.replace('/thumbnails/', '/images/').replace('thumb_', '');
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="btn-remove-img"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => {
                            const next = [...prev.sub_images];
                            next[index] = '';
                            return { ...prev, sub_images: next };
                          });
                        }}
                      >×</button>
                    </>
                  ) : uploading === index ? (
                    <div className="upload-loading"><div className="spinner"></div></div>
                  ) : (
                    <div className="sub-upload-placeholder"><span>+</span></div>
                  )}
                  <input
                    type="file"
                    id={`subFileInput-${index}`}
                    onChange={(e) => handleFileChange(e, index)}
                    hidden
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>New Price</label>
            <input
              type="number"
              name="new_price"
              value={formData.new_price}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
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
              min="0.01"
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
                <th>Image</th>
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
                  <td className="admin-product-img-td">
                    <img 
                      src={getImageUrl(product.thumbnail || product.image) || 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvczg0LXRlZC0xNTg3OWEucG5n.png'} 
                      alt="" 
                      className="admin-product-thumb"
                      onError={(e) => {
                        if (e.target.src.includes('rawpixel.com')) {
                          e.target.onerror = null;
                          return;
                        }
                        const original = getImageUrl(product.image);
                        if (e.target.src !== original && original) {
                          e.target.src = original;
                        } else {
                           e.target.src = 'https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvczg0LXRlZC0xNTg3OWEucG5n.png';
                           e.target.onerror = null;
                        }
                      }}
                    />
                  </td>
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

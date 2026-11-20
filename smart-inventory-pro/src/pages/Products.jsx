import React, { useEffect, useState } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiPackage, 
  FiFilter,
  FiX,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { api } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: 0,
    sku: '',
    name: '',
    categoryId: '',
    unitPrice: '',
    costPrice: '',
    currentStock: '0',
    leadTimeDays: '3',
    safetyStock: '5',
    targetStockDays: '30',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        api.getProducts(),
        api.getCategories(),
      ]);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value);
      if (catRes.status === 'fulfilled') setCategories(catRes.value);
    } catch (err) {
      toast.error('Failed to communicate with Java database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      productId: 0,
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      unitPrice: '',
      costPrice: '',
      currentStock: '10',
      leadTimeDays: '3',
      safetyStock: '5',
      targetStockDays: '30',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setFormData({
      productId: p.productId,
      sku: p.sku,
      name: p.name,
      categoryId: p.categoryId || '',
      unitPrice: p.unitPrice,
      costPrice: p.costPrice,
      currentStock: p.currentStock,
      leadTimeDays: p.leadTimeDays,
      safetyStock: p.safetyStock,
      targetStockDays: p.targetStockDays,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.unitPrice || Number(formData.unitPrice) <= 0) {
      setFormError('Please enter a valid unit selling price.');
      return;
    }

    try {
      if (isEditing) {
        await api.updateProduct(formData);
        toast.success(
          <div>
            <strong>Product Updated:</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
              Changes to "{formData.name}" saved.
            </div>
          </div>,
          { icon: '💾' }
        );
      } else {
        await api.addProduct(formData);
        toast.success(
          <div>
            <strong>Product Created:</strong>
            <div style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
              "{formData.name}" (SKU: {formData.sku}) added to catalog.
            </div>
          </div>,
          { icon: '✨' }
        );
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
      toast.error(err.message || 'Could not save product.');
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    const { productId, name, sku } = deleteConfirmProduct;
    setDeleteConfirmProduct(null);
    try {
      await api.deleteProduct(productId);
      toast.success(
        <div>
          <strong>Item Deleted:</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
            "{name}" ({sku}) removed from catalog.
          </div>
        </div>,
        { icon: '🗑️', autoClose: 3500 }
      );
      fetchData();
    } catch (err) {
      toast.error('Delete failed: ' + (err.message || 'Operation could not be completed.'));
    }
  };

  const getCategoryBadgeClass = (catName) => {
    const c = (catName || '').toLowerCase();
    if (c.includes('elect')) return 'badge-cat-electronics';
    if (c.includes('stat')) return 'badge-cat-stationery';
    if (c.includes('groc')) return 'badge-cat-groceries';
    if (c.includes('care') || c.includes('person')) return 'badge-cat-personal';
    return 'badge-cat-default';
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || String(p.categoryId) === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Product Inventory Management</h2>
          <p className="text-muted">Maintain product records, categories, unit prices, and lead-time configurations.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <FiFilter className="filter-icon" />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={String(c.categoryId)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Cost Price</th>
                <th>Current Stock</th>
                <th>Lead Time</th>
                <th>Safety Buffer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    {loading ? 'Fetching catalog from MySQL backend...' : 'No products found matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.productId}>
                    <td>
                      <code className="sku-badge">{p.sku}</code>
                    </td>
                    <td className="product-name-cell">
                      <span className="product-title-text">{p.name}</span>
                    </td>
                    <td>
                      <span className={`badge-category-pill ${getCategoryBadgeClass(p.categoryName)}`}>
                        {p.categoryName || 'General'}
                      </span>
                    </td>
                    <td>
                      <strong className="text-price">₹{Number(p.unitPrice).toFixed(2)}</strong>
                    </td>
                    <td className="text-muted">
                      ₹{Number(p.costPrice).toFixed(2)}
                    </td>
                    <td>
                      <span className={`stock-pill ${p.currentStock <= p.safetyStock ? 'stock-critical' : p.currentStock <= 15 ? 'stock-warning' : 'stock-ok'}`}>
                        {p.currentStock} units
                      </span>
                    </td>
                    <td>{p.leadTimeDays} days</td>
                    <td>{p.safetyStock} units</td>
                    <td>
                      <div className="table-action-group">
                        <button 
                          className="btn-action-icon btn-action-edit" 
                          title="Edit Product"
                          onClick={() => openEditModal(p)}
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className="btn-action-icon btn-action-delete" 
                          title="Delete Product"
                          onClick={() => setDeleteConfirmProduct(p)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Product' : 'Add New Inventory Product'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              {formError && <div className="alert alert-error">{formError}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label>SKU (Stock Keeping Unit)</label>
                  <input 
                    type="text" 
                    value={formData.sku} 
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Logitech Wireless Mouse"
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={formData.categoryId} 
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Stock on Shelf</label>
                  <input 
                    type="number" 
                    min="0" 
                    disabled={isEditing}
                    value={formData.currentStock} 
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit Selling Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="650.00"
                    value={formData.unitPrice} 
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="480.00"
                    value={formData.costPrice} 
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-section-title">Demand Prediction Parameters</div>
              <div className="form-row">
                <div className="form-group">
                  <label title="Supplier delivery time in days">Supplier Lead Time (Days)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.leadTimeDays} 
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label title="Emergency stock buffer">Safety Stock Buffer (Units)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.safetyStock} 
                    onChange={(e) => setFormData({ ...formData, safetyStock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label title="Desired days of supply">Target Coverage (Days)</label>
                  <input 
                    type="number" 
                    min="7" 
                    value={formData.targetStockDays} 
                    onChange={(e) => setFormData({ ...formData, targetStockDays: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal (Replaces browser confirm) */}
      {deleteConfirmProduct && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmProduct(null)}>
          <div className="modal-card delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon-wrap">
              <FiAlertCircle className="delete-modal-warn-icon" />
            </div>
            <h3 className="delete-modal-title">Delete Product from Inventory</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete <strong>"{deleteConfirmProduct.name}"</strong>?
            </p>
            <div className="delete-modal-product-chip">
              <span className="sku-badge">{deleteConfirmProduct.sku}</span>
              <span className="stock-info-pill">{deleteConfirmProduct.currentStock} units in stock</span>
            </div>
            <p className="delete-modal-subtext">
              This will remove the item from catalog and recalculate demand metrics. The deletion will stay saved even after refreshing.
            </p>
            <div className="modal-actions-bar delete-actions-bar">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setDeleteConfirmProduct(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger-confirm" 
                onClick={confirmDeleteProduct}
              >
                <FiTrash2 /> Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

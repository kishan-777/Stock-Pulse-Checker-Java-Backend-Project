import React, { useEffect, useState } from 'react';
import { 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiInfo, 
  FiTruck, 
  FiArrowUpRight,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { api } from '../services/api';

export default function DemandPredictor() {
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictions();
      setRecommendations(data);
    } catch (err) {
      console.warn('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModalItem) return;
    try {
      const qty = parseInt(restockQty, 10);
      await api.recordStockIn({
        productId: restockModalItem.productId,
        quantity: qty,
        reason: 'Restock Order via Demand Predictor Engine',
      });
      toast.success(`🚚 Ordered +${qty} units of "${restockModalItem.productName}"!`);
      setRestockModalItem(null);
      loadPredictions();
    } catch (err) {
      toast.error('Restock order failed: ' + err.message);
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

  const filteredItems = recommendations.filter((item) => {
    if (filter === 'ALL') return true;
    return item.urgencyStatus === filter;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Smart Demand Predictor & Restocking Engine</h2>
          <p className="text-muted">
            Automates purchase order suggestions using the <strong>Reorder Point (ROP)</strong> and historical moving average sales velocity.
          </p>
        </div>
      </div>

      {/* Formula Educational Card */}
      <div className="formula-card">
        <div className="formula-header">
          <FiInfo className="formula-icon" />
          <div>
            <h4>How the Prediction Algorithm Works</h4>
          </div>
        </div>
        <div className="formula-grid">
          <div className="formula-box">
            <span className="formula-title">1. Reorder Point (ROP) Trigger</span>
            <code>ROP = (Average Daily Sales × Lead Time in Days) + Safety Stock</code>
            <p className="formula-desc">
              If <strong>Current Stock ≤ ROP</strong>, the product is flagged for replenishment so you don't run out while waiting for delivery.
            </p>
          </div>
          <div className="formula-box">
            <span className="formula-title">2. Suggested Restock Quantity</span>
            <code>Suggested Restock = (Target Stock Days × Average Daily Sales) - Current Stock</code>
            <p className="formula-desc">
              Calculates the exact quantity to order to return shelf inventory to the shopkeeper's target coverage (e.g. 30 days).
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-pill-container">
        <button 
          className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Items ({recommendations.length})
        </button>
        <button 
          className={`filter-pill pill-critical ${filter === 'CRITICAL' ? 'active' : ''}`}
          onClick={() => setFilter('CRITICAL')}
        >
          <FiAlertCircle /> Critical Urgent (
          {recommendations.filter((r) => r.urgencyStatus === 'CRITICAL').length})
        </button>
        <button 
          className={`filter-pill pill-warning ${filter === 'WARNING' ? 'active' : ''}`}
          onClick={() => setFilter('WARNING')}
        >
          <FiAlertTriangle /> Reorder Warnings (
          {recommendations.filter((r) => r.urgencyStatus === 'WARNING').length})
        </button>
        <button 
          className={`filter-pill pill-optimal ${filter === 'OPTIMAL' ? 'active' : ''}`}
          onClick={() => setFilter('OPTIMAL')}
        >
          <FiCheckCircle /> Healthy Stock (
          {recommendations.filter((r) => r.urgencyStatus === 'OPTIMAL').length})
        </button>
      </div>

      {/* Predictions Table Card */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Sales Velocity (ADS)</th>
                <th>Lead Time</th>
                <th>Safety Buffer</th>
                <th>Calculated ROP</th>
                <th>Days Remaining</th>
                <th>Suggested Order</th>
                <th>Urgency Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5 text-muted">
                    {loading ? 'Analyzing historical sales records from MySQL...' : 'No items match the selected filter.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.productId} className={item.urgencyStatus === 'CRITICAL' ? 'row-critical' : ''}>
                    <td className="product-name-cell">
                      <strong className="product-title-text">{item.productName}</strong>
                      <div className="text-muted"><code className="sku-badge">{item.sku}</code></div>
                    </td>
                    <td>
                      <span className={`badge-category-pill ${getCategoryBadgeClass(item.categoryName)}`}>
                        {item.categoryName}
                      </span>
                    </td>
                    <td>
                      <span className="stock-number">{item.currentStock} units</span>
                    </td>
                    <td>
                      <strong className="text-emerald">{item.averageDailySales}</strong> /day
                    </td>
                    <td>{item.leadTimeDays}d</td>
                    <td>{item.safetyStock}u</td>
                    <td>
                      <span className="badge badge-rop" title={`ROP = (${item.averageDailySales} × ${item.leadTimeDays}) + ${item.safetyStock}`}>
                        {item.reorderPoint} units
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`days-badge ${item.daysOfSupplyRemaining <= 2.5 ? 'days-critical' : item.daysOfSupplyRemaining <= 7 ? 'days-warning' : 'days-ok'}`}
                        title={`Days Calculation: ${item.currentStock} units ÷ ${item.averageDailySales} units/day = ${(item.currentStock / item.averageDailySales).toFixed(2)} days (~${Math.floor(item.daysOfSupplyRemaining)}d ${Math.round((item.daysOfSupplyRemaining % 1) * 24)}h of remaining supply)`}
                      >
                        {item.daysOfSupplyRemaining} days
                      </span>
                    </td>
                    <td>
                      {item.suggestedRestockQuantity > 0 ? (
                        <strong className="text-restock-suggest">
                          +{item.suggestedRestockQuantity} units
                        </strong>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        item.urgencyStatus === 'CRITICAL' ? 'badge-danger' :
                        item.urgencyStatus === 'WARNING' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {item.urgencyStatus}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-group">
                        <button 
                          className="btn-action-icon btn-action-info"
                          title="View Mathematical Calculation Breakdown"
                          onClick={() => setSelectedProductDetails(item)}
                        >
                          <FiInfo />
                        </button>
                        {item.suggestedRestockQuantity > 0 && (
                          <button 
                            className="btn-restock-pill"
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQty(String(item.suggestedRestockQuantity));
                            }}
                          >
                            <FiTruck /> Restock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Details Modal - Minimalist Card-Based Design */}
      {selectedProductDetails && (
        <div className="modal-backdrop">
          <div className="modal-card breakdown-modal-card">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="breakdown-sku-tag">{selectedProductDetails.sku}</span>
                <h3>{selectedProductDetails.productName}</h3>
              </div>
              <button className="btn-close" onClick={() => setSelectedProductDetails(null)}>
                <FiX />
              </button>
            </div>

            <div className="breakdown-body minimal-breakdown">
              {/* Status Verdict Header Banner */}
              <div className={`breakdown-status-banner ${selectedProductDetails.currentStock <= selectedProductDetails.reorderPoint ? 'banner-critical' : 'banner-healthy'}`}>
                <div className="banner-icon-col">
                  {selectedProductDetails.currentStock <= selectedProductDetails.reorderPoint ? (
                    <FiAlertCircle className="status-ico-danger" />
                  ) : (
                    <FiCheckCircle className="status-ico-healthy" />
                  )}
                </div>
                <div className="banner-text-col">
                  <div className="banner-headline">
                    {selectedProductDetails.currentStock <= selectedProductDetails.reorderPoint 
                      ? '⚠️ CRITICAL REPLENISHMENT TRIGGERED' 
                      : '✅ OPTIMAL INVENTORY HEALTH'}
                  </div>
                  <p className="banner-desc">{selectedProductDetails.explanation}</p>
                </div>
              </div>

              {/* 4 Clean Metric Cards Grid */}
              <div className="breakdown-cards-grid">
                {/* Metric 1: Daily Velocity */}
                <div className="breakdown-card">
                  <span className="card-phase-label">STEP 1 &bull; 30-DAY VELOCITY</span>
                  <div className="card-primary-stat">
                    {selectedProductDetails.averageDailySales} <span className="stat-unit">units / day</span>
                  </div>
                  <p className="card-sub-info">Empirical 30-day moving average sales rate</p>
                </div>

                {/* Metric 2: ROP Formula */}
                <div className="breakdown-card">
                  <span className="card-phase-label">STEP 2 &bull; REORDER POINT (ROP)</span>
                  <div className="card-primary-stat text-emerald">
                    {selectedProductDetails.reorderPoint} <span className="stat-unit">units</span>
                  </div>
                  <div className="card-equation-box">
                    <code>({selectedProductDetails.averageDailySales} &times; {selectedProductDetails.leadTimeDays}d) + {selectedProductDetails.safetyStock}u = {selectedProductDetails.reorderPoint}</code>
                  </div>
                </div>

                {/* Metric 3: Current Stock vs ROP */}
                <div className="breakdown-card">
                  <span className="card-phase-label">SHELF STOCK VS THRESHOLD</span>
                  <div className="card-primary-stat">
                    {selectedProductDetails.currentStock} <span className="stat-unit">/ {selectedProductDetails.reorderPoint} units</span>
                  </div>
                  <div className={`threshold-verdict ${selectedProductDetails.currentStock <= selectedProductDetails.reorderPoint ? 'verdict-danger' : 'verdict-safe'}`}>
                    {selectedProductDetails.currentStock <= selectedProductDetails.reorderPoint ? 'Below Reorder Point' : 'Above Safety Threshold'}
                  </div>
                </div>

                {/* Metric 4: Suggested Purchase Refill */}
                <div className="breakdown-card highlight-restock-card">
                  <span className="card-phase-label">STEP 3 &bull; SUGGESTED REFILL</span>
                  <div className="card-primary-stat text-primary">
                    +{selectedProductDetails.suggestedRestockQuantity} <span className="stat-unit">units</span>
                  </div>
                  <p className="card-sub-info">Refills inventory to {selectedProductDetails.targetStockDays}-day target coverage</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedProductDetails(null)}>
                Close Breakdown
              </button>
              {selectedProductDetails.suggestedRestockQuantity > 0 && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const item = selectedProductDetails;
                    setSelectedProductDetails(null);
                    setRestockModalItem(item);
                    setRestockQty(String(item.suggestedRestockQuantity));
                  }}
                >
                  <FiTruck /> Raise Restock Order (+{selectedProductDetails.suggestedRestockQuantity})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Restock Order Modal */}
      {restockModalItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Restock Order: {restockModalItem.productName}</h3>
              <button className="btn-close" onClick={() => setRestockModalItem(null)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleRestockSubmit} className="modal-form">
              <p className="text-muted">
                The Demand Predictor recommends ordering <strong>{restockModalItem.suggestedRestockQuantity} units</strong> to achieve a {restockModalItem.targetStockDays}-day safe coverage.
              </p>
              <div className="form-group">
                <label>Confirm Order Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setRestockModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiTruck /> Place Supplier Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

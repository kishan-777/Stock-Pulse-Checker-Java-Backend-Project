import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiAlertTriangle, 
  FiAlertCircle, 
  FiArrowUpRight, 
  FiArrowDownRight,
  FiTrendingUp,
  FiRefreshCw,
  FiPlay,
  FiCheckCircle,
  FiBell,
  FiLayers,
  FiBarChart2
} from 'react-icons/fi';
import { api } from '../services/api';
import DemoVideoModal from '../components/DemoVideoModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalProducts: 18,
    totalUnitsInStock: 220,
    totalInventoryValue: 34500.0,
    criticalAlerts: 4,
    warningAlerts: 6,
    optimalCount: 8,
  });
  const [predictions, setPredictions] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, predRes, movRes] = await Promise.allSettled([
        api.getDashboardMetrics(),
        api.getPredictions(),
        api.getStockMovements(),
      ]);

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
      if (predRes.status === 'fulfilled') setPredictions(predRes.value.slice(0, 5));
      if (movRes.status === 'fulfilled') setRecentMovements(movRes.value.slice(0, 5));
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Official Hero Banner - Matching User Mockup */}
      <div className="spc-hero-card animated-hero-banner">
        <div className="spc-hero-content">
          <div className="hero-top-badge">
            <FiBarChart2 />
            <span>Smart Inventory. Smarter Decisions.</span>
          </div>

          <h1 className="hero-main-title">
            Stock <span className="hero-title-pulse">Pulse</span> Checker
          </h1>

          <div className="hero-tagline">
            Monitor. Analyze. Refill.
          </div>

          <p className="hero-description">
            Track your inventory in real-time, get smart stock insights, and know exactly when to place a reorder.
          </p>

          <div className="hero-cta-group">
            <button 
              className="btn btn-hero-primary" 
              onClick={() => navigate('/demand-predictor')}
            >
              <FiBarChart2 /> Check Your Stock &rarr;
            </button>
            <button 
              className="btn btn-hero-secondary"
              onClick={() => setIsDemoModalOpen(true)}
            >
              <FiPlay className="play-icon-fill" /> Watch Demo
            </button>
          </div>

          <div className="hero-features-strip">
            <div className="hero-feature-pill">
              <FiLayers className="text-emerald" />
              <span>Real-Time Inventory Tracking</span>
            </div>
            <div className="hero-feature-pill">
              <FiTrendingUp className="text-emerald" />
              <span>Smart Stock Analytics</span>
            </div>
            <div className="hero-feature-pill">
              <FiBell className="text-emerald" />
              <span>Low Stock Alerts</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup Image */}
        <div className="spc-hero-visual-pane">
          <img 
            src="/spc-hero-banner.jpg" 
            alt="StockPulse Checker Dashboard Preview" 
            className="hero-laptop-preview"
          />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card card-blue">
          <div className="metric-icon-wrap">
            <FiPackage className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Catalog Products</span>
            <span className="metric-value">{metrics.totalProducts}</span>
            <span className="metric-hint">4 warehouse categories</span>
          </div>
        </div>

        <div className="metric-card card-emerald">
          <div className="metric-icon-wrap">
            <span className="metric-rupee-icon">₹</span>
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Inventory Valuation</span>
            <span className="metric-value">₹{Number(metrics.totalInventoryValue || 0).toLocaleString('en-IN')}</span>
            <span className="metric-hint">Physical stock at cost basis</span>
          </div>
        </div>

        <div className="metric-card card-rose">
          <div className="metric-icon-wrap">
            <FiAlertCircle className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-label">Critical Stockouts</span>
            <span className="metric-value">{metrics.criticalAlerts}</span>
            <span className="metric-hint">At or below safety buffer</span>
          </div>
        </div>

        <div className="metric-card card-amber">
          <div className="metric-icon-wrap">
            <FiAlertTriangle className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-label">Reorder Warnings</span>
            <span className="metric-value">{metrics.warningAlerts}</span>
            <span className="metric-hint">Below calculated ROP</span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Fluid & Clean */}
      <div className="dashboard-columns">
        {/* Urgent Restock Recommendations */}
        <div className="column-card">
          <div className="card-header">
            <div className="header-title">
              <FiTrendingUp className="header-icon text-rose" />
              <h3>Urgent Restock Action Plan</h3>
            </div>
            <Link to="/demand-predictor" className="header-link">View All &rarr;</Link>
          </div>

          <table className="custom-table fluid-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>ROP</th>
                <th>Suggested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No restock recommendations pending.</td>
                </tr>
              ) : (
                predictions.map((p) => (
                  <tr key={p.productId}>
                    <td>
                      <div className="product-title-cell">
                        <strong>{p.productName}</strong>
                        <span className="sku-subtext">{p.sku}</span>
                      </div>
                    </td>
                    <td>
                      <span className="stock-number">{p.currentStock}</span>
                    </td>
                    <td>
                      <span className="badge badge-rop">{p.reorderPoint}</span>
                    </td>
                    <td>
                      <strong className="text-primary">+{p.suggestedRestockQuantity}</strong>
                    </td>
                    <td>
                      <span className={`badge ${p.urgencyStatus === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                        {p.urgencyStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Stock Movements */}
        <div className="column-card">
          <div className="card-header">
            <div className="header-title">
              <FiRefreshCw className="header-icon text-primary" />
              <h3>Recent Stock Movements</h3>
            </div>
            <Link to="/stock" className="header-link">Manage &rarr;</Link>
          </div>

          <table className="custom-table fluid-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">No stock movements logged.</td>
                </tr>
              ) : (
                recentMovements.map((m) => (
                  <tr key={m.movementId}>
                    <td>
                      <span className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                        {m.movementType === 'IN' ? <FiArrowUpRight /> : <FiArrowDownRight />}
                        {m.movementType}
                      </span>
                    </td>
                    <td>
                      <div className="product-title-cell">
                        <strong>{m.productName}</strong>
                        <span className="sku-subtext">{m.reason}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}</strong>
                    </td>
                    <td className="text-muted small">
                      {m.movementDate ? new Date(m.movementDate).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive AI Demo Modal */}
      <DemoVideoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, 
  FiTrendingUp, 
  FiRefreshCw, 
  FiShoppingCart, 
  FiLayers,
  FiTruck
} from 'react-icons/fi';

export default function Sidebar() {
  return (
    <aside className="sidebar-container">
      {/* Brand Header with Animated Official SPC 3D Logo */}
      <div className="sidebar-brand">
        <div className="brand-logo-spc-wrap" title="Stock Pulse Checker (SPC)">
          <img 
            src="/spc-logo.jpg" 
            alt="Stock Pulse Checker Logo" 
            className="brand-spc-img animated-logo-pulse" 
          />
        </div>

        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-title">StockPulse</span>
            <span className="brand-edition-tag">CHECKER</span>
          </div>
          <span className="brand-subtitle">Monitor • Analyze • Refill</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">OPERATIONS</div>

        <NavLink to="/" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')} end>
          <FiGrid className="link-icon" />
          <span>Executive Dashboard</span>
        </NavLink>

        <NavLink to="/products" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          <FiLayers className="link-icon" />
          <span>Product Catalog</span>
        </NavLink>

        <NavLink to="/stock" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          <FiRefreshCw className="link-icon" />
          <span>Stock In / Out</span>
        </NavLink>

        <NavLink to="/sales" className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          <FiShoppingCart className="link-icon" />
          <span>Point of Sale (POS)</span>
        </NavLink>

        <NavLink to="/deliveries" className={({ isActive }) => (isActive ? 'sidebar-link active badge-link' : 'sidebar-link badge-link')}>
          <FiTruck className="link-icon" />
          <span>Deliveries</span>
          <span className="sidebar-nav-pill">COD</span>
        </NavLink>

        <div className="nav-section-label" style={{ marginTop: '1.4rem' }}>FORECASTING</div>

        <NavLink to="/demand-predictor" className={({ isActive }) => (isActive ? 'sidebar-link active badge-link' : 'sidebar-link badge-link')}>
          <FiTrendingUp className="link-icon" />
          <span>Demand Predictor</span>
          <span className="sidebar-nav-pill">ROP</span>
        </NavLink>
      </nav>
    </aside>
  );
}

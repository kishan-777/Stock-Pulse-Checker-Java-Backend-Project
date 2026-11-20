import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiBox, 
  FiGrid, 
  FiTrendingUp, 
  FiRefreshCw, 
  FiShoppingCart, 
  FiServer,
  FiCheckCircle,
  FiAlertCircle,
  FiMaximize,
  FiMinimize,
  FiClock
} from 'react-icons/fi';
import { api } from '../services/api';

export default function Navbar() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const checkConnection = async () => {
    try {
      const res = await api.checkHealth();
      if (res && res.status === 'UP') {
        setServerStatus('connected');
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error enabling fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="navbar-container">
      <div className="nav-brand">
        <div className="brand-logo">
          <FiBox className="brand-icon" />
        </div>
        <div className="brand-text">
          <div className="brand-header-row">
            <span className="brand-title">SmartInventory</span>
            <span className="brand-edition-tag">PRO</span>
          </div>
          <span className="brand-subtitle">Demand Predictor & Stock Control</span>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FiGrid />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FiBox />
          <span>Catalog</span>
        </NavLink>
        <NavLink to="/stock" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FiRefreshCw />
          <span>Stock In/Out</span>
        </NavLink>
        <NavLink to="/sales" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FiShoppingCart />
          <span>Point of Sale</span>
        </NavLink>
        <NavLink to="/demand-predictor" className={({ isActive }) => (isActive ? 'nav-link active badge-link' : 'nav-link badge-link')}>
          <FiTrendingUp />
          <span>Demand Predictor</span>
          <span className="nav-pill">ROP</span>
        </NavLink>
      </nav>

      <div className="nav-right-controls">
        {/* Real-time Clock */}
        <div className="nav-clock" title="System Local Time">
          <FiClock className="clock-icon" />
          <span>{currentTime}</span>
        </div>

        {/* Server Status Badge */}
        <div className="nav-status">
          {serverStatus === 'connected' ? (
            <div className="status-badge status-online" title="Java Backend connected at http://localhost:8080">
              <span className="live-dot pulse"></span>
              <span>Java Backend Active</span>
            </div>
          ) : serverStatus === 'checking' ? (
            <div className="status-badge status-checking">
              <FiServer className="status-icon spin" />
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="status-badge status-offline" title="Run backend with run.bat or InventoryTerminalApp">
              <span className="live-dot offline"></span>
              <span>Backend Offline (:8080)</span>
            </div>
          )}
        </div>

        {/* 1-Click Fullscreen Button */}
        <button 
          className="btn-icon btn-fullscreen" 
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen Mode'}
        >
          {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
        </button>
      </div>
    </header>
  );
}

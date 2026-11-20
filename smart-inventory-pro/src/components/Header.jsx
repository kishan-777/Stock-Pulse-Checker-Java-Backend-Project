import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMaximize, FiMinimize, FiSun, FiMoon } from 'react-icons/fi';

export default function Header() {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spc-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spc-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
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

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return { title: 'Executive Overview', subtitle: 'Live inventory telemetry & critical restocking triggers' };
      case '/products': return { title: 'Product Catalog', subtitle: 'Manage SKUs, unit rates & safety buffers' };
      case '/stock': return { title: 'Stock In / Out', subtitle: 'Record inward vendor deliveries & write-offs' };
      case '/sales': return { title: 'Point of Sale (POS)', subtitle: 'Checkout counter with instant receipt & ledger printing' };
      case '/demand-predictor': return { title: 'Demand Predictor Engine', subtitle: 'Reorder Point (ROP) calculation & suggested purchase orders' };
      default: return { title: 'StockPulse Checker', subtitle: 'Inventory Control' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="topbar-header">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        <p className="topbar-subtitle">{subtitle}</p>
      </div>

      <div className="topbar-right">
        {/* Light Mode / Dark Mode Theme Switcher */}
        <button 
          className="btn-theme-switcher"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <FiSun className="theme-icon sun-icon" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <FiMoon className="theme-icon moon-icon" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Fullscreen Button */}
        <button 
          className="btn-topbar-fullscreen" 
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode (F11)'}
          aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode'}
        >
          {isFullscreen ? <FiMinimize size={19} /> : <FiMaximize size={19} />}
        </button>
      </div>
    </header>
  );
}

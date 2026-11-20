import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockInOut from './pages/StockInOut';
import SalesRegister from './pages/SalesRegister';
import DemandPredictor from './pages/DemandPredictor';
import Deliveries from './pages/Deliveries';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Left Hand Side Navigation Panel */}
        <Sidebar />

        {/* Right Hand Side Main Content Area */}
        <div className="app-main-viewport">
          <Header />
          <main className="content-scroll-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stock" element={<StockInOut />} />
              <Route path="/sales" element={<SalesRegister />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/cod" element={<Deliveries />} />
              <Route path="/demand-predictor" element={<DemandPredictor />} />
            </Routes>
          </main>
        </div>

        {/* Global Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

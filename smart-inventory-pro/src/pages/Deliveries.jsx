import React, { useEffect, useState } from 'react';
import { 
  FiTruck, 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock, 
  FiDownload, 
  FiRotateCcw, 
  FiAlertTriangle, 
  FiX, 
  FiCheck,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';

export default function Deliveries() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COLLECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [voidConfirmInvoice, setVoidConfirmInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.warn('Failed to load deliveries data', err);
    }
  };

  // Filter only cash sales for delivery tracking
  const cashSales = sales.filter((s) => s.paymentMode === 'Cash');
  const pendingSales = cashSales.filter((s) => s.paymentStatus === 'PENDING_CASH');
  const collectedSales = cashSales.filter((s) => s.paymentStatus !== 'PENDING_CASH');

  const totalCashAmount = cashSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
  const pendingCashAmount = pendingSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
  const collectedCashAmount = collectedSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);

  const displayedSales = cashSales.filter((s) => {
    if (filter === 'PENDING') return s.paymentStatus === 'PENDING_CASH';
    if (filter === 'COLLECTED') return s.paymentStatus !== 'PENDING_CASH';
    return true;
  }).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(q)) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.productName && s.productName.toLowerCase().includes(q))
    );
  });

  // Mark cash collected action
  const handleMarkCashCollected = async (invNo) => {
    try {
      await api.markCashCollected(invNo);
      const target = cashSales.find((s) => s.invoiceNo === invNo);
      toast.success(
        `Payment is done successfully! ₹${target ? Number(target.totalAmount).toFixed(2) : ''} cash collected for ${invNo}.`,
        { icon: '💵', autoClose: 4000 }
      );
      await loadData();
    } catch (err) {
      toast.error('Failed to update cash status: ' + err.message);
    }
  };

  // Undo / Void accidental cash order
  const handleExecuteVoid = async () => {
    if (!voidConfirmInvoice) return;
    const invNo = voidConfirmInvoice.invoiceNo;
    setVoidConfirmInvoice(null);

    try {
      const res = await api.voidSale(invNo);
      toast.success(
        <div>
          <strong>Payment & Invoice Voided!</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
            Invoice {invNo} cancelled. +{res.restoredQuantity || 1} units of "{res.productName}" restored to inventory!
          </div>
        </div>,
        { icon: '↩️', autoClose: 5000 }
      );
      await loadData();
    } catch (err) {
      toast.error('Could not void invoice: ' + err.message);
    }
  };

  // Download Invoice PDF directly
  const downloadInvoicePdf = (inv) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text('STOCKPULSE CHECKER (SPC)', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Cash on Delivery Receipt & Delivery Challan', 14, 26);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 31);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 35, 196, 35);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Invoice Number: ${inv.invoiceNo}`, 14, 45);
      doc.text(`Payment Mode: Cash on Delivery (COD)`, 14, 52);
      doc.text(`Customer Name: ${inv.customerName || 'Walk-in Customer'}`, 14, 59);
      doc.text(`Status: ${inv.paymentStatus === 'PENDING_CASH' ? 'Pending on Delivery' : 'PAID / Collected'}`, 14, 66);

      doc.setFillColor(241, 245, 249);
      doc.rect(14, 75, 182, 10, 'F');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text('DESCRIPTION', 18, 81);
      doc.text('TOTAL AMOUNT', 150, 81);

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(inv.productName || 'Retail Purchase Items', 18, 93);
      doc.text(`INR ${Number(inv.totalAmount).toFixed(2)}`, 150, 93);

      doc.line(14, 102, 196, 102);

      doc.setFontSize(12);
      doc.text(`GRAND TOTAL: INR ${Number(inv.totalAmount).toFixed(2)}`, 130, 112);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Thank you for choosing StockPulse Checker! Verified ACID transaction.', 14, 130);

      doc.save(`COD_Invoice_${inv.invoiceNo}.pdf`);
      toast.success(`Tax invoice ${inv.invoiceNo}.pdf downloaded!`);
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Cash on Delivery & Deliveries (COD)</h2>
          <p className="text-muted">
            Track payments to be collected on delivery, confirm cash collections, and manage unintentional orders.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="metrics-grid" style={{ marginBottom: '1.8rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL COD ORDERS</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <FiTruck size={20} />
            </div>
          </div>
          <div className="metric-value">{cashSales.length}</div>
          <div className="metric-subtitle">₹{totalCashAmount.toFixed(2)} total volume</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PENDING ON DELIVERY</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <FiClock size={20} />
            </div>
          </div>
          <div className="metric-value text-amber">{pendingSales.length}</div>
          <div className="metric-subtitle">₹{pendingCashAmount.toFixed(2)} awaiting collection</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">CASH COLLECTED</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <FiCheckCircle size={20} />
            </div>
          </div>
          <div className="metric-value text-emerald">{collectedSales.length}</div>
          <div className="metric-subtitle">₹{collectedCashAmount.toFixed(2)} collected</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card">
        {/* Controls Bar: Filters & Search */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="filter-pill-container" style={{ margin: 0 }}>
            <button 
              className={`filter-pill ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All Deliveries ({cashSales.length})
            </button>
            <button 
              className={`filter-pill pill-warning ${filter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilter('PENDING')}
            >
              <FiClock /> Pending ({pendingSales.length})
            </button>
            <button 
              className={`filter-pill pill-optimal ${filter === 'COLLECTED' ? 'active' : ''}`}
              onClick={() => setFilter('COLLECTED')}
            >
              <FiCheckCircle /> Collected ({collectedSales.length})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control"
              style={{ paddingLeft: '34px', minHeight: '38px', fontSize: '0.88rem' }}
              placeholder="Search by invoice or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Deliveries Table with side-to-side scrolling */}
        <div className="table-wrapper">
          <table className="custom-table" style={{ minWidth: '950px' }}>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer / Recipient</th>
                <th>Purchased Items</th>
                <th>Payable Amount</th>
                <th>Order Date</th>
                <th>Delivery Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No cash delivery orders found for this view.
                  </td>
                </tr>
              ) : (
                displayedSales.map((s) => {
                  const isPending = s.paymentStatus === 'PENDING_CASH';
                  return (
                    <tr key={s.saleId}>
                      <td>
                        <strong className="text-primary invoice-code-tag">{s.invoiceNo}</strong>
                      </td>
                      <td>
                        <div className="font-semibold">{s.customerName || 'Walk-in Customer'}</div>
                      </td>
                      <td>
                        <span className="text-muted">{s.productName || 'Retail Purchase'}</span>
                      </td>
                      <td>
                        <strong className="text-price">₹{Number(s.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td className="text-muted small">
                        {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : 'Today'}
                      </td>
                      <td>
                        <span className={`status-pill ${isPending ? 'pill-pending' : 'pill-collected'}`}>
                          {isPending ? '⏳ Pay on Delivery' : '✓ Cash Collected'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {isPending && (
                            <button 
                              type="button"
                              className="btn btn-sm btn-success btn-collect-cash"
                              onClick={() => handleMarkCashCollected(s.invoiceNo)}
                              title="Customer paid cash on delivery"
                            >
                              <FiCheck /> Collect Cash
                            </button>
                          )}
                          <button 
                            type="button"
                            className="btn-action-icon btn-action-download" 
                            title="Download Delivery Challan / Invoice PDF"
                            onClick={() => downloadInvoicePdf(s)}
                          >
                            <FiDownload />
                          </button>
                          <button 
                            type="button"
                            className="btn-action-icon btn-action-void" 
                            title="Undo / Void accidental order (Restores stock to inventory)"
                            onClick={() => setVoidConfirmInvoice({
                              invoiceNo: s.invoiceNo,
                              customer: s.customerName,
                              total: s.totalAmount,
                              productName: s.productName || 'Purchased Item',
                              quantity: s.quantity || 1
                            })}
                          >
                            <FiRotateCcw />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void Confirmation Modal */}
      {voidConfirmInvoice && (
        <div className="modal-backdrop">
          <div className="modal-card modal-void-confirm" style={{ maxWidth: '540px', width: '95%' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <FiRotateCcw className="modal-icon text-rose" />
                <h3>Undo & Void Accidental Order</h3>
              </div>
              <button className="btn-close" onClick={() => setVoidConfirmInvoice(null)}><FiX /></button>
            </div>

            <div className="void-modal-body">
              <div className="void-warning-alert">
                <FiAlertTriangle className="warning-icon" />
                <div>
                  <strong>Are you sure you want to void this delivery order?</strong>
                  <p>This manages faulty or unintentional orders created by mistake.</p>
                </div>
              </div>

              <div className="void-invoice-summary">
                <div className="void-summary-row">
                  <span>Invoice Number:</span>
                  <strong>{voidConfirmInvoice.invoiceNo}</strong>
                </div>
                <div className="void-summary-row">
                  <span>Customer:</span>
                  <span>{voidConfirmInvoice.customer || 'Walk-in Customer'}</span>
                </div>
                <div className="void-summary-row">
                  <span>Total Amount:</span>
                  <span className="text-price font-bold">₹{Number(voidConfirmInvoice.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="stock-restore-notice">
                <FiCheckCircle className="text-emerald" />
                <span>
                  <strong>Automatic Inventory Restoration:</strong> Deducted stock will be immediately credited back to available inventory with an audit log record.
                </span>
              </div>

              <div className="void-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setVoidConfirmInvoice(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger-confirm" 
                  onClick={handleExecuteVoid}
                >
                  <FiRotateCcw /> Void & Restore Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

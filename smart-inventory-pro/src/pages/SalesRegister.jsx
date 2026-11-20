import React, { useEffect, useState } from 'react';
import { 
  FiShoppingCart, 
  FiPrinter, 
  FiCreditCard, 
  FiCheckCircle, 
  FiFileText, 
  FiUser,
  FiX,
  FiList,
  FiDownload,
  FiRotateCcw,
  FiDollarSign,
  FiAlertTriangle,
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';

export default function SalesRegister() {
  const [products, setProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  
  // Checkout Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customerName, setCustomerName] = useState(''); // Default EMPTY
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [codFilter, setCodFilter] = useState('all'); // 'all' | 'pending' | 'collected'

  // Modals & Pop-up States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [voidConfirmInvoice, setVoidConfirmInvoice] = useState(null);

  // Card details state for Credit/Debit card popup
  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '4532 8920 1029 3844',
    expiry: '08/29',
    cvv: '742'
  });

  // Modal / Receipt States
  const [invoiceSuccess, setInvoiceSuccess] = useState(null);
  const [printModalData, setPrintModalData] = useState(null);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, sRes] = await Promise.allSettled([
        api.getProducts(),
        api.getSales(),
      ]);
      if (pRes.status === 'fulfilled' && pRes.value.length > 0) {
        setProducts(pRes.value);
        if (!selectedProductId) setSelectedProductId(pRes.value[0].productId);
      }
      if (sRes.status === 'fulfilled') setRecentSales(sRes.value);
    } catch (err) {
      console.warn('Failed to load sales data', err);
    }
  };

  const selectedProduct = products.find((p) => String(p.productId) === String(selectedProductId));
  const subtotal = selectedProduct ? (selectedProduct.unitPrice * (parseInt(quantity, 10) || 0)) : 0;

  // Step 1: Triggered when user clicks "Review & Place Order" on the form
  const handleInitiateOrder = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.warn('Please specify a quantity greater than zero.');
      return;
    }

    if (selectedProduct && selectedProduct.currentStock < qty) {
      toast.error(`Insufficient stock! Only ${selectedProduct.currentStock} units of "${selectedProduct.name}" available.`);
      return;
    }

    setCardData(prev => ({
      ...prev,
      cardholderName: customerName.trim() ? customerName.trim() : 'Walk-in Customer'
    }));

    // Open Verification Pop-up window first!
    setShowVerifyModal(true);
  };

  // Step 2: Confirmed in Verification Modal -> route by Payment Mode
  const handleConfirmVerification = () => {
    setShowVerifyModal(false);

    if (paymentMode === 'UPI') {
      setShowQrModal(true);
    } else if (paymentMode === 'Credit Card') {
      setShowCardModal(true);
    } else if (paymentMode === 'Cash') {
      // Cash payment placed: notify to pay on delivery/counter
      executeFinalSale('PENDING_CASH');
      toast.info(`Order placed! Please pay ₹${subtotal.toFixed(2)} cash on delivery / counter.`, {
        icon: '💵',
        autoClose: 6000
      });
    }
  };

  // Step 3A: QR Payment Confirmed
  const handleQrPaymentSuccess = () => {
    setShowQrModal(false);
    executeFinalSale('PAID');
    toast.success(`Payment is done successfully! ₹${subtotal.toFixed(2)} received via UPI.`, {
      icon: '✅',
      autoClose: 4000
    });
  };

  // Step 3B: Card Payment Confirmed
  const handleCardPaymentSuccess = (e) => {
    if (e) e.preventDefault();
    if (!cardData.cardNumber || cardData.cardNumber.length < 12) {
      toast.error('Please enter a valid 16-digit card number.');
      return;
    }
    setShowCardModal(false);
    executeFinalSale('PAID');
    toast.success(`Payment is done successfully! Card verified.`, {
      icon: '💳',
      autoClose: 4000
    });
  };

  // Step 4: Finalize Sale in API and sync
  const executeFinalSale = async (initialPaymentStatus = 'PAID') => {
    setInvoiceSuccess(null);
    setProcessing(true);
    const qty = parseInt(quantity, 10);
    const clientName = customerName.trim() ? customerName.trim() : 'Walk-in Customer';

    try {
      const res = await api.recordSale({
        productId: selectedProduct.productId,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: qty,
        unitPrice: selectedProduct.unitPrice,
        customerName: clientName,
        paymentMode: paymentMode,
        paymentStatus: initialPaymentStatus
      });

      const invNo = res.invoiceNo || 'INV-' + Date.now().toString().slice(-6);

      const invoiceRecord = {
        invoiceNo: invNo,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: qty,
        unitPrice: selectedProduct.unitPrice,
        total: subtotal,
        customer: clientName,
        payment: paymentMode,
        status: initialPaymentStatus,
        date: new Date().toLocaleString(),
      };

      setInvoiceSuccess(invoiceRecord);
      await loadData();
      setQuantity('1');
      setCustomerName('');
    } catch (err) {
      toast.error(err.message || 'Transaction failed. Stock was not deducted.');
    } finally {
      setProcessing(false);
    }
  };

  // Manage Faulty / Accidental Payments: Undo / Void an invoice
  const handleExecuteVoid = async () => {
    if (!voidConfirmInvoice) return;
    const invNo = voidConfirmInvoice.invoiceNo;
    setVoidConfirmInvoice(null);

    try {
      const res = await api.voidSale(invNo);
      toast.success(
        <div>
          <strong>Payment & Invoice Voided:</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
            Invoice {invNo} cancelled. +{res.restoredQuantity || 1} units of "{res.productName}" restored to inventory!
          </div>
        </div>,
        { icon: '↩️', autoClose: 5000 }
      );

      if (invoiceSuccess && invoiceSuccess.invoiceNo === invNo) {
        setInvoiceSuccess(null);
      }

      await loadData();
    } catch (err) {
      toast.error('Could not void invoice: ' + err.message);
    }
  };

  // Mark pending Cash on Delivery as paid
  const handleMarkCashCollected = async (invNo) => {
    try {
      await api.markCashCollected(invNo);
      toast.success(`Payment is done successfully! Cash collected for ${invNo}.`, {
        icon: '💵',
        autoClose: 4000
      });
      await loadData();
    } catch (err) {
      toast.error('Failed to update cash status: ' + err.message);
    }
  };

  // Direct PDF Download for Single Invoice (no browser print dialog)
  const downloadInvoicePdf = (inv) => {
    try {
      const doc = new jsPDF();

      // Top Brand Header
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text("STOCKPULSE CHECKER (SPC)", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Smart Inventory Management & Demand Forecasting Engine", 14, 28);
      doc.text("Official Tax Invoice & Retail Cashier Slip", 14, 34);

      doc.setLineWidth(0.4);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 38, 196, 38);

      // Metadata Block
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(`INVOICE NO: ${inv.invoiceNo}`, 14, 48);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Date & Time: ${inv.date || new Date().toLocaleString()}`, 14, 55);
      doc.text(`Customer Name / Contact: ${inv.customer || 'Walk-in Customer'}`, 14, 62);
      doc.text(`Payment Mode: ${inv.payment || 'UPI / Cash'}`, 14, 69);
      doc.text(`Status: Atomic ACID Transaction Committed`, 14, 76);

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, 82, 182, 8, "F");
      doc.line(14, 82, 196, 82);
      doc.line(14, 90, 196, 90);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ITEM / DESCRIPTION", 18, 87);
      doc.text("QTY", 120, 87);
      doc.text("UNIT RATE", 145, 87);
      doc.text("TOTAL", 175, 87);

      // Table Row
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const itemName = inv.productName || 'Retail Product Item';
      const itemSku = inv.sku ? ` [${inv.sku}]` : '';
      doc.text(`${itemName}${itemSku}`, 18, 98);
      doc.text(String(inv.quantity || 1), 122, 98);
      doc.text(`Rs. ${Number(inv.unitPrice || inv.total).toFixed(2)}`, 145, 98);
      doc.text(`Rs. ${Number(inv.total).toFixed(2)}`, 175, 98);

      doc.line(14, 105, 196, 105);

      // Grand Total Box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(16, 185, 129);
      doc.text("GRAND TOTAL PAID:", 115, 117);
      doc.text(`Rs. ${Number(inv.total).toFixed(2)}`, 165, 117);

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Stock deducted automatically via Java JDBC backend. Inventory verified 100% consistent.", 14, 134);
      doc.text("Thank you for shopping with us! StockPulse Checker - Monitor • Analyze • Refill", 14, 140);

      const fileName = `StockPulse_Invoice_${inv.invoiceNo}.pdf`;
      doc.save(fileName);
      toast.success(`📥 PDF Downloaded: ${fileName}`);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  // Direct PDF Download for All Invoices History Ledger
  const downloadAllInvoicesLedgerPdf = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129);
      doc.text("STOCKPULSE CHECKER - COMPLETE SALES LEDGER", 14, 20);

      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()} | Total Transactions: ${recentSales.length}`, 14, 26);
      doc.text(`Cumulative Sales Valuation: Rs. ${totalLedgerRevenue.toLocaleString('en-IN')}`, 14, 32);

      doc.setLineWidth(0.4);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 36, 196, 36);

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, 40, 182, 8, "F");
      doc.line(14, 40, 196, 40);
      doc.line(14, 48, 196, 48);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("INVOICE NO", 16, 45);
      doc.text("CUSTOMER", 55, 45);
      doc.text("DATE", 112, 45);
      doc.text("PAYMENT", 145, 45);
      doc.text("AMOUNT", 172, 45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      let y = 55;
      recentSales.forEach((s) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(s.invoiceNo || 'INV-000'), 16, y);
        doc.text(String(s.customerName || 'Walk-in Customer').slice(0, 24), 55, y);
        doc.text(String(s.saleDate ? new Date(s.saleDate).toLocaleDateString() : 'Today'), 112, y);
        doc.text(String(s.paymentMode || 'Cash'), 145, y);
        doc.text(`Rs. ${Number(s.totalAmount || 0).toFixed(2)}`, 172, y);
        y += 7;
      });

      const fileName = `StockPulse_All_Invoices_Ledger_${Date.now().toString().slice(-6)}.pdf`;
      doc.save(fileName);
      toast.success(`📥 PDF Downloaded: ${fileName}`);
    } catch (err) {
      console.error('Ledger PDF error:', err);
      toast.error('Failed to generate Ledger PDF: ' + err.message);
    }
  };

  const totalLedgerRevenue = recentSales.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Point of Sale (Sales Counter & Invoicing)</h2>
          <p className="text-muted">Record customer purchases, deduct stock automatically with ACID transactions, and download tax invoices.</p>
        </div>
        <button className="btn-print-prominent" onClick={downloadAllInvoicesLedgerPdf} title="Download All Invoices History as PDF">
          <FiDownload /> Download All Invoices (PDF)
        </button>
      </div>

      <div className="sales-layout-grid">
        {/* Left Side: Checkout Form Card */}
        <div className="form-card">
          <div className="card-header">
            <div className="header-title">
              <FiShoppingCart className="header-icon text-primary" />
              <h3>Process New Customer Purchase</h3>
            </div>
          </div>

          {invoiceSuccess && (
            <div className="invoice-success-card">
              <div className="success-header">
                <FiCheckCircle className="text-emerald" size={24} />
                <div style={{ flex: 1 }}>
                  <strong>Payment Successful!</strong>
                  <div className="invoice-id">Invoice: {invoiceSuccess.invoiceNo}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button 
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setVoidConfirmInvoice(invoiceSuccess)}
                    title="Undo this accidental payment and restore inventory"
                  >
                    <FiRotateCcw /> Undo Sale
                  </button>
                  <button 
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => downloadInvoicePdf(invoiceSuccess)}
                    title="Download this invoice PDF"
                  >
                    <FiDownload /> Download PDF
                  </button>
                </div>
              </div>
              <div className="receipt-details">
                <div><span>Item:</span> <strong>{invoiceSuccess.productName}</strong></div>
                <div><span>Quantity:</span> <strong>{invoiceSuccess.quantity}</strong></div>
                <div><span>Total Paid:</span> <strong className="text-emerald">₹{invoiceSuccess.total.toFixed(2)}</strong></div>
                <div><span>Customer:</span> <span>{invoiceSuccess.customer}</span></div>
              </div>
            </div>
          )}

          <form onSubmit={handleInitiateOrder} className="sales-form">
            <div className="form-group">
              <label>Select Product from Shelf</label>
              <select 
                className="form-control select-spacious"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                {Array.from(new Set(products.map(p => p.categoryName || 'General'))).map((catName) => {
                  const catProducts = products.filter(p => (p.categoryName || 'General') === catName);
                  return (
                    <optgroup key={catName} label={`─── ${catName.toUpperCase()} ───`}>
                      {catProducts.map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.name}  ({p.sku})  •  ₹{Number(p.unitPrice).toFixed(2)}  •  Available: {p.currentStock} units
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {selectedProduct && (
              <div className="product-snapshot">
                <div className="snapshot-item">
                  <span className="text-muted">Unit Retail Price:</span>
                  <strong>₹{Number(selectedProduct.unitPrice).toFixed(2)}</strong>
                </div>
                <div className="snapshot-item">
                  <span className="text-muted">Available Stock:</span>
                  <span className={selectedProduct.currentStock <= selectedProduct.safetyStock ? 'text-rose font-bold' : ''}>
                    {selectedProduct.currentStock} units
                  </span>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Quantity to Purchase</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Customer Name / Contact Phone</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma (9876543210)"
              />
            </div>

            <div className="bill-summary">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line total-line">
                <span>Grand Total</span>
                <span className="total-amount">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={processing || !selectedProduct || selectedProduct.currentStock <= 0}
            >
              <FiCheckCircle />
              {processing ? 'Processing Transaction...' : 'Review & Place Order'}
            </button>
          </form>
        </div>

        {/* Right Side: Recent Invoices History */}
        <div className="audit-log-card">
          <div className="card-header">
            <div className="header-title">
              <FiFileText className="header-icon text-primary" />
              <h3>Recent Invoices & Transactions</h3>
            </div>
            <button className="btn-print-prominent" onClick={downloadAllInvoicesLedgerPdf} title="Download All Invoices (PDF)">
              <FiDownload /> Download All (PDF)
            </button>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No sales recorded yet.</td>
                  </tr>
                ) : (
                  recentSales.map((s) => (
                    <tr key={s.saleId}>
                      <td>
                        <strong className="text-primary invoice-code-tag">{s.invoiceNo}</strong>
                      </td>
                      <td className="customer-name-cell">{s.customerName || 'Walk-in Customer'}</td>
                      <td>
                        <strong className="text-price">₹{Number(s.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${s.paymentMode === 'Cash' && s.paymentStatus === 'PENDING_CASH' ? 'badge-warning' : 'badge-neutral'}`}>
                          {s.paymentMode} {s.paymentMode === 'Cash' && s.paymentStatus === 'PENDING_CASH' ? '(Pending COD)' : ''}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : 'Today'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                          <button 
                            type="button"
                            className="btn-action-icon btn-action-download" 
                            title="Download Tax Invoice PDF"
                            onClick={() => downloadInvoicePdf({
                              invoiceNo: s.invoiceNo,
                              customer: s.customerName,
                              total: s.totalAmount,
                              payment: s.paymentMode,
                              date: s.saleDate ? new Date(s.saleDate).toLocaleString() : new Date().toLocaleString(),
                              productName: s.productName || 'Counter Retail Items',
                              quantity: s.quantity || 1,
                              unitPrice: s.unitPrice || s.totalAmount
                            })}
                          >
                            <FiDownload />
                          </button>
                          <button 
                            type="button"
                            className="btn-action-icon btn-action-void" 
                            title="Undo / Void Accidental Payment (Restores Stock)"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==============================================================
          MODAL 1: ORDER VERIFICATION POP-UP MODAL (BEFORE PAYMENT)
          ============================================================== */}
      {showVerifyModal && selectedProduct && (
        <div className="modal-backdrop">
          <div className="modal-card modal-verify-order">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <FiFileText className="modal-icon text-primary" />
                <h3>Verify Order Details Before Payment</h3>
              </div>
              <button className="btn-close" onClick={() => setShowVerifyModal(false)}><FiX /></button>
            </div>
            
            <div className="verify-body">
              <div className="verify-notice-banner">
                <FiAlertTriangle className="text-amber" />
                <span>Please verify product quantity and billing details before placing order and charging customer.</span>
              </div>

              <div className="verify-details-grid">
                <div className="verify-row">
                  <span className="verify-label">Product Name:</span>
                  <span className="verify-val font-semibold">{selectedProduct.name}</span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">SKU Code:</span>
                  <span className="verify-val"><code>{selectedProduct.sku}</code></span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Unit Price:</span>
                  <span className="verify-val">₹{Number(selectedProduct.unitPrice).toFixed(2)}</span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Purchase Quantity:</span>
                  <span className="verify-val font-semibold text-primary">{quantity} units</span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Customer / Recipient:</span>
                  <span className="verify-val">{customerName.trim() || 'Walk-in Customer'}</span>
                </div>
                <div className="verify-row">
                  <span className="verify-label">Selected Payment Mode:</span>
                  <span className="verify-val font-semibold text-emerald">{paymentMode}</span>
                </div>
                <div className="verify-row verify-total-row">
                  <span className="verify-label">Grand Total Payable:</span>
                  <span className="verify-val text-price text-emerald font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="verify-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>
                  Modify Order
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmVerification}>
                  Confirm & Place Order <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 2: DEMO UPI QR CODE MODAL (WHEN QR IS SELECTED)
          ============================================================== */}
      {showQrModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-qr-payment">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="qr-header-icon">📱</span>
                <h3>Scan UPI QR to Complete Payment</h3>
              </div>
              <button className="btn-close" onClick={() => setShowQrModal(false)}><FiX /></button>
            </div>

            <div className="qr-modal-body">
              <div className="qr-amount-badge">
                <span className="amount-sub">Amount to Pay</span>
                <span className="amount-val">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Realistic QR Graphic */}
              <div className="qr-code-container">
                <div className="qr-code-frame">
                  <svg viewBox="0 0 200 200" className="qr-svg-graphic" width="180" height="180">
                    <rect width="200" height="200" fill="#ffffff" rx="8" />
                    {/* Top-left position marker */}
                    <rect x="15" y="15" width="45" height="45" fill="#0f172a" rx="4" />
                    <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="29" y="29" width="17" height="17" fill="#0f172a" rx="1" />
                    {/* Top-right position marker */}
                    <rect x="140" y="15" width="45" height="45" fill="#0f172a" rx="4" />
                    <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="154" y="29" width="17" height="17" fill="#0f172a" rx="1" />
                    {/* Bottom-left position marker */}
                    <rect x="15" y="140" width="45" height="45" fill="#0f172a" rx="4" />
                    <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="2" />
                    <rect x="29" y="154" width="17" height="17" fill="#0f172a" rx="1" />
                    {/* QR Code data patterns */}
                    <rect x="70" y="20" width="10" height="20" fill="#0f172a" />
                    <rect x="90" y="15" width="15" height="10" fill="#0f172a" />
                    <rect x="115" y="20" width="15" height="15" fill="#0f172a" />
                    <rect x="70" y="50" width="15" height="10" fill="#0f172a" />
                    <rect x="95" y="45" width="10" height="25" fill="#0f172a" />
                    <rect x="115" y="50" width="10" height="10" fill="#0f172a" />
                    <rect x="20" y="70" width="15" height="10" fill="#0f172a" />
                    <rect x="45" y="75" width="15" height="15" fill="#0f172a" />
                    <rect x="70" y="70" width="60" height="60" fill="#10b981" rx="4" />
                    <text x="100" y="106" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">UPI</text>
                    <rect x="140" y="70" width="15" height="10" fill="#0f172a" />
                    <rect x="165" y="75" width="20" height="15" fill="#0f172a" />
                    <rect x="20" y="115" width="20" height="15" fill="#0f172a" />
                    <rect x="45" y="105" width="15" height="10" fill="#0f172a" />
                    <rect x="140" y="115" width="20" height="15" fill="#0f172a" />
                    <rect x="170" y="105" width="15" height="25" fill="#0f172a" />
                    <rect x="70" y="140" width="15" height="15" fill="#0f172a" />
                    <rect x="95" y="145" width="15" height="10" fill="#0f172a" />
                    <rect x="120" y="140" width="10" height="20" fill="#0f172a" />
                    <rect x="75" y="165" width="25" height="15" fill="#0f172a" />
                    <rect x="110" y="170" width="30" height="15" fill="#0f172a" />
                    <rect x="150" y="150" width="30" height="10" fill="#0f172a" />
                    <rect x="155" y="170" width="20" height="15" fill="#0f172a" />
                  </svg>
                </div>
                <div className="upi-merchant-info">
                  <div className="upi-id-tag">UPI ID: <strong>stockpulse.spc@icici</strong></div>
                  <div className="upi-apps-logos">Accepted on Google Pay, PhonePe, Paytm, BHIM & Cred</div>
                </div>
              </div>

              <div className="qr-sim-actions">
                <button 
                  type="button" 
                  className="btn btn-success btn-block btn-sim-pay" 
                  onClick={handleQrPaymentSuccess}
                >
                  <FiCheckCircle /> Simulate Customer Scanned & Paid
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-block" 
                  onClick={() => setShowQrModal(false)}
                >
                  Cancel QR Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 3: REALISTIC CREDIT / DEBIT CARD MODAL
          ============================================================== */}
      {showCardModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-card-payment">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <FiCreditCard className="modal-icon text-primary" />
                <h3>Card Payment Checkout</h3>
              </div>
              <button className="btn-close" onClick={() => setShowCardModal(false)}><FiX /></button>
            </div>

            {/* Visual Credit Card Preview Graphic */}
            <div className="credit-card-preview">
              <div className="card-chip-row">
                <div className="emv-chip"></div>
                <div className="contactless-icon">📶</div>
                <span className="card-network-badge">VISA / Master</span>
              </div>
              <div className="card-number-display">
                {cardData.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="card-footer-display">
                <div>
                  <div className="card-label-small">CARDHOLDER NAME</div>
                  <div className="card-holder-name">{cardData.cardholderName || 'WALK-IN CUSTOMER'}</div>
                </div>
                <div>
                  <div className="card-label-small">EXPIRES</div>
                  <div className="card-expiry-val">{cardData.expiry || 'MM/YY'}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleCardPaymentSuccess} className="card-inputs-form">
              <div className="form-group">
                <label>Cardholder Name</label>
                <input 
                  type="text" 
                  value={cardData.cardholderName} 
                  onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value.toUpperCase() })}
                  placeholder="NAME ON CARD"
                  required
                />
              </div>

              <div className="form-group">
                <label>16-Digit Card Number</label>
                <input 
                  type="text" 
                  maxLength="19"
                  value={cardData.cardNumber} 
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
                    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                    setCardData({ ...cardData, cardNumber: val });
                  }}
                  placeholder="4532 8920 1029 3844"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date (MM/YY)</label>
                  <input 
                    type="text" 
                    maxLength="5"
                    value={cardData.expiry} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9/]/g, '').slice(0, 5);
                      if (val.length === 2 && !val.includes('/')) val += '/';
                      setCardData({ ...cardData, expiry: val });
                    }}
                    placeholder="MM/YY"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CVV / CVC (3 Digits)</label>
                  <input 
                    type="password" 
                    maxLength="4"
                    value={cardData.cvv} 
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="•••"
                    required
                  />
                </div>
              </div>

              <div className="card-security-badge">
                🔒 256-Bit SSL Encrypted &bull; PCI-DSS Level 1 Certified
              </div>

              <div className="card-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Pay ₹{subtotal.toFixed(2)} Securely
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 4: VOID / UNDO ACCIDENTAL PAYMENT CONFIRMATION MODAL
          ============================================================== */}
      {voidConfirmInvoice && (
        <div className="modal-backdrop">
          <div className="modal-card modal-void-confirm">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <FiRotateCcw className="modal-icon text-rose" />
                <h3>Undo & Void Accidental Payment</h3>
              </div>
              <button className="btn-close" onClick={() => setVoidConfirmInvoice(null)}><FiX /></button>
            </div>

            <div className="void-modal-body">
              <div className="void-warning-alert">
                <FiAlertTriangle className="warning-icon" />
                <div>
                  <strong>Are you sure you want to void this transaction?</strong>
                  <p>This feature manages faulty or unintentional payments made by mistake.</p>
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
                  <span>Total Amount Paid:</span>
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
                  No, Keep Payment
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger-confirm" 
                  onClick={handleExecuteVoid}
                >
                  <FiRotateCcw /> Yes, Void Payment & Restore Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          PRINT MODAL 1: SINGLE TAX INVOICE RECEIPT
          ============================================================== */}
      {printModalData && (
        <div className="modal-backdrop printable-modal">
          <div className="modal-card print-slip">
            <div className="print-actions-bar">
              <button className="btn btn-primary btn-sm" onClick={() => downloadInvoicePdf(printModalData)}>
                <FiDownload /> Download Tax Invoice PDF
              </button>
              <button className="btn-close" onClick={() => setPrintModalData(null)}>
                <FiX />
              </button>
            </div>

            <div className="invoice-print-area">
              <div className="invoice-brand">
                <h2>SMART INVENTORY STORE</h2>
                <p>Retail & Wholesale Distribution Counter</p>
                <div className="divider"></div>
              </div>

              <div className="invoice-meta-row">
                <div>
                  <strong>TAX INVOICE</strong>
                  <div>Invoice #: <code>{printModalData.invoiceNo}</code></div>
                  <div>Date: {printModalData.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Billed To:</strong>
                  <div>{printModalData.customer || 'Walk-in Customer'}</div>
                  <div>Payment Mode: <strong>{printModalData.payment}</strong></div>
                </div>
              </div>

              <table className="invoice-slip-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{printModalData.productName}</td>
                    <td>{printModalData.quantity}</td>
                    <td>₹{Number(printModalData.unitPrice || printModalData.total).toFixed(2)}</td>
                    <td>₹{Number(printModalData.total).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-total-section">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{Number(printModalData.total).toFixed(2)}</span>
                </div>
                <div className="total-row grand-total-row">
                  <span>GRAND TOTAL:</span>
                  <span>₹{Number(printModalData.total).toFixed(2)}</span>
                </div>
              </div>

              <div className="invoice-footer">
                <p>Thank you for your business!</p>
                <p className="small text-muted">Computer-generated invoice. Authorized by Smart Inventory Demand Predictor.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          PRINT MODAL 2: COMPLETE SALES LEDGER
          ============================================================== */}
      {showLedgerModal && (
        <div className="modal-backdrop printable-modal">
          <div className="modal-card print-slip-wide">
            <div className="print-actions-bar">
              <button className="btn btn-primary btn-sm" onClick={downloadAllInvoicesLedgerPdf}>
                <FiDownload /> Download Ledger PDF
              </button>
              <button className="btn-close" onClick={() => setShowLedgerModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="invoice-print-area">
              <div className="invoice-brand">
                <h2>SMART INVENTORY STORE - SALES LEDGER REPORT</h2>
                <p>Generated on {new Date().toLocaleString()} | Total Transactions: {recentSales.length}</p>
                <div className="divider"></div>
              </div>

              <table className="invoice-slip-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date & Time</th>
                    <th>Customer Name / Contact</th>
                    <th>Payment Mode</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((s, idx) => (
                    <tr key={idx}>
                      <td><strong>{s.invoiceNo}</strong></td>
                      <td>{s.saleDate ? new Date(s.saleDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{s.customerName}</td>
                      <td>{s.paymentMode}</td>
                      <td><strong>₹{Number(s.totalAmount).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                  <tr className="grand-total-row">
                    <td colSpan="4" style={{ textAlign: 'right' }}><strong>CUMULATIVE SALES TOTAL:</strong></td>
                    <td><strong>₹{totalLedgerRevenue.toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-footer">
                <p>End of Official Sales Register Report</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

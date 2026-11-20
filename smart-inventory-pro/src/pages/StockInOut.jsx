import React, { useEffect, useState } from 'react';
import { 
  FiArrowUpRight, 
  FiArrowDownRight, 
  FiPackage, 
  FiRefreshCw, 
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { api } from '../services/api';

export default function StockInOut() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [activeTab, setActiveTab] = useState('IN');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, mRes] = await Promise.allSettled([
        api.getProducts(),
        api.getStockMovements(),
      ]);
      if (pRes.status === 'fulfilled' && pRes.value.length > 0) {
        setProducts(pRes.value);
        if (!selectedProductId) setSelectedProductId(pRes.value[0].productId);
      }
      if (mRes.status === 'fulfilled') setMovements(mRes.value);
    } catch (err) {
      console.warn('Load failed:', err);
    }
  };

  const selectedProduct = products.find((p) => String(p.productId) === String(selectedProductId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.warn('Please enter a valid positive quantity.');
      return;
    }

    if (activeTab === 'OUT' && selectedProduct && selectedProduct.currentStock < qty) {
      toast.error(`Insufficient stock! Cannot deduct ${qty} units. Current stock is ${selectedProduct.currentStock}.`);
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'IN') {
        await api.recordStockIn({
          productId: selectedProductId,
          quantity: qty,
          reason: reason || 'Vendor Inward Shipment',
        });
        toast.success(`📦 Received +${qty} units of "${selectedProduct?.name}"!`);
      } else {
        await api.recordStockOut({
          productId: selectedProductId,
          quantity: qty,
          reason: reason || 'Damaged / Write-off',
        });
        toast.info(`📤 Deducted -${qty} units of "${selectedProduct?.name}".`);
      }
      setQuantity('');
      setReason('');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Stock transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Stock Movement & Inventory Adjustments</h2>
          <p className="text-muted">Record inward supplier deliveries or write off damaged / expired goods.</p>
        </div>
      </div>

      <div className="stock-layout-grid">
        {/* Form Card */}
        <div className="form-card">
          <div className="tab-pill-group">
            <button 
              className={`tab-pill ${activeTab === 'IN' ? 'active-in' : ''}`}
              onClick={() => setActiveTab('IN')}
            >
              <FiArrowUpRight /> Record Stock-In (Inward)
            </button>
            <button 
              className={`tab-pill ${activeTab === 'OUT' ? 'active-out' : ''}`}
              onClick={() => setActiveTab('OUT')}
            >
              <FiArrowDownRight /> Record Stock-Out (Outward)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="stock-form">
            <div className="form-group">
              <label>Select Product</label>
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
                          {p.name}  ({p.sku})  •  Available: {p.currentStock} units
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
                  <span className="snapshot-label">Current Stock:</span>
                  <strong className="snapshot-val">{selectedProduct.currentStock} units</strong>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-label">Safety Buffer:</span>
                  <span className="snapshot-val">{selectedProduct.safetyStock} units</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-label">Lead Time:</span>
                  <span className="snapshot-val">{selectedProduct.leadTimeDays} days</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Quantity to {activeTab === 'IN' ? 'Receive' : 'Deduct'}</label>
              <input 
                type="number" 
                className="form-control"
                min="1" 
                placeholder="e.g. 25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason / Note / Vendor Invoice</label>
              <input 
                type="text" 
                className="form-control"
                placeholder={activeTab === 'IN' ? 'e.g. Supplier Batch #401' : 'e.g. Broken in transit / Expired'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-block ${activeTab === 'IN' ? 'btn-stock-confirm-in' : 'btn-stock-confirm-out'}`}
              disabled={submitting}
            >
              {activeTab === 'IN' ? <FiArrowUpRight /> : <FiArrowDownRight />}
              {submitting ? 'Processing Transaction...' : activeTab === 'IN' ? 'Confirm Stock Inward' : 'Confirm Stock Deduction'}
            </button>
          </form>
        </div>

        {/* Recent Audit Log */}
        <div className="audit-log-card">
          <div className="card-header">
            <h3>Recent Stock Movement Log</h3>
            <button className="btn-refresh" onClick={loadData} title="Refresh live stock movements">
              <FiRefreshCw className="refresh-icon-spin" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Reason / Note</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No stock movement logs recorded yet.</td>
                  </tr>
                ) : (
                  movements.slice(0, 15).map((m) => (
                    <tr key={m.movementId}>
                      <td>
                        <span className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                          {m.movementType}
                        </span>
                      </td>
                      <td>
                        <strong>{m.productName}</strong>
                        <div className="text-muted small">{m.sku}</div>
                      </td>
                      <td>
                        <strong>{m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}</strong>
                      </td>
                      <td className="text-muted small">{m.reason}</td>
                      <td className="text-muted small">
                        {m.movementDate ? new Date(m.movementDate).toLocaleString() : 'Just now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

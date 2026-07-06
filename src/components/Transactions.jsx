import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, fmtMoney, fmtDate } from '../store';

export default function Transactions({ data, onAdd, onDelete, openModal, onModalClose }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { if (openModal) { setShowModal(true); onModalClose?.(); } }, [openModal]);
  const [form, setForm] = useState({ name: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0] });

  const filtered = useMemo(() => {
    return [...data.transactions]
      .filter(t => filter === 'all' || t.type === filter)
      .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.transactions, filter, search]);

  const handleSubmit = () => {
    if (!form.name || !form.amount) return;
    const cat = CATEGORIES.find(c => c.name === form.category);
    onAdd({ ...form, amount: parseFloat(form.amount), emoji: cat?.emoji || '📌' });
    setShowModal(false);
    setForm({ name: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Transactions</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{filtered.length} entries</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Transaction</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="🔍  Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="tabs" style={{ marginBottom: 0 }}>
            {['all', 'income', 'expense'].map(f => (
              <div key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💸</div>
            <div className="empty-text">No transactions found</div>
            <div className="empty-sub">Add your first transaction to get started</div>
          </div>
        ) : (
          <div className="tx-list">
            {filtered.map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: tx.type === 'income' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)' }}>{tx.emoji}</div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name}</div>
                  <div className="tx-cat">{tx.category} • {fmtDate(tx.date)}</div>
                </div>
                <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{tx.type}</span>
                <div className={`tx-amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmtMoney(tx.amount)}
                </div>
                <div className="tx-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(tx.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">
              Add Transaction
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="e.g. Groceries" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { CATEGORIES, fmtMoney } from '../store';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

export default function Budget({ data, onAddBudget, onDeleteBudget }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limit: '' });

  const budgetStatus = useMemo(() => {
    return data.budgets.map(b => {
      const spent = data.transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
      const pct = Math.min(100, Math.round((spent / b.limit) * 100));
      return { ...b, spent, pct, remaining: Math.max(0, b.limit - spent) };
    });
  }, [data.budgets, data.transactions]);

  const totalBudget = budgetStatus.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetStatus.reduce((s, b) => s + b.spent, 0);

  const handleAdd = () => {
    if (!form.limit) return;
    const cat = CATEGORIES.find(c => c.name === form.category);
    onAddBudget({ category: form.category, limit: parseFloat(form.limit), emoji: cat?.emoji || '📌' });
    setShowModal(false);
    setForm({ category: 'Food', limit: '' });
  };

  const getColor = pct => pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--accent4)' : 'var(--accent)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Budget Planner</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Track spending against your limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Budget</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card balance">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value balance">{fmtMoney(totalBudget)}</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value expense">{fmtMoney(totalSpent)}</div>
        </div>
        <div className="stat-card saving">
          <div className="stat-label">Remaining</div>
          <div className="stat-value saving">{fmtMoney(totalBudget - totalSpent)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📋 Category Budgets</div>
          {budgetStatus.length === 0 ? (
            <div className="empty"><div className="empty-icon">🎯</div><div className="empty-text">No budgets set</div></div>
          ) : budgetStatus.map(b => (
            <div key={b.id} className="cat-card">
              <div className="cat-header">
                <div className="cat-info">
                  <span className="cat-emoji">{b.emoji}</span>
                  <div>
                    <div className="cat-name">{b.category}</div>
                    <div style={{ fontSize: 11, color: b.pct >= 90 ? 'var(--danger)' : 'var(--text2)' }}>
                      {b.pct >= 90 ? '⚠️ Over limit!' : b.pct >= 70 ? '⚡ Getting close' : '✅ On track'}
                    </div>
                  </div>
                </div>
                <div className="cat-amounts">
                  <div className="cat-spent" style={{ color: getColor(b.pct) }}>{fmtMoney(b.spent)}</div>
                  <div className="cat-limit">of {fmtMoney(b.limit)}</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: b.pct + '%', background: getColor(b.pct) }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{b.pct}% used • {fmtMoney(b.remaining)} left</span>
                <button className="btn btn-danger btn-sm" onClick={() => onDeleteBudget(b.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">📊 Spending Overview</div>
          <ResponsiveContainer width="100%" height={320}>
            <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={150} data={budgetStatus.map((b, i) => ({ name: b.category, value: b.pct, fill: ['#6c63ff','#ff6584','#43e97b','#f7971e','#38bdf8','#a78bfa'][i % 6] }))}>
              <RadialBar dataKey="value" background={{ fill: '#23263a' }} />
              <Tooltip formatter={v => v + '%'} contentStyle={{ background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 10 }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {budgetStatus.map((b, i) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#6c63ff','#ff6584','#43e97b','#f7971e','#38bdf8','#a78bfa'][i % 6] }} />
                {b.category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">
              Set Budget Limit
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Limit ($)</label>
              <input className="form-input" type="number" placeholder="500" value={form.limit} onChange={e => setForm({...form, limit: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Set Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

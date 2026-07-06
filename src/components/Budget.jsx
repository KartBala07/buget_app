import { useState, useMemo } from 'react';
import { CATEGORIES, fmtMoney } from '../store';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6c63ff','#ff6584','#43e97b','#f7971e','#38bdf8','#a78bfa','#fb923c','#34d399','#f472b6','#60a5fa','#a3e635','#e879f9'];

export default function Budget({ data, onAddBudget, onDeleteBudget }) {
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
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

  const openAdd = () => { setEditBudget(null); setForm({ category: 'Food', limit: '' }); setShowModal(true); };
  const openEdit = (b) => { setEditBudget(b); setForm({ category: b.category, limit: String(b.limit) }); setShowModal(true); };

  const handleSave = () => {
    if (!form.limit) return;
    const cat = CATEGORIES.find(c => c.name === form.category);
    onAddBudget({ category: form.category, limit: parseFloat(form.limit), emoji: cat?.emoji || '📌' });
    setShowModal(false);
  };

  const getColor = (pct, i) => pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--accent4)' : COLORS[i % COLORS.length];

  const radialData = budgetStatus.map((b, i) => ({ name: b.category, value: b.pct, fill: COLORS[i % COLORS.length] }));

  const existingCats = new Set(data.budgets.map(b => b.category));
  const availableCats = editBudget ? CATEGORIES : CATEGORIES.filter(c => !existingCats.has(c.name));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Budget Planner</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Set monthly spending limits per category</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={availableCats.length === 0}>+ Set Limit</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card balance">
          <div className="stat-label">Total Budget</div>
          <div className="stat-value balance">{fmtMoney(totalBudget)}</div>
          <div className="stat-change">{data.budgets.length} categories</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value expense">{fmtMoney(totalSpent)}</div>
          <div className={`stat-change ${totalSpent > totalBudget ? 'down' : 'up'}`}>{totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0}% of budget</div>
        </div>
        <div className="stat-card saving">
          <div className="stat-label">Remaining</div>
          <div className="stat-value saving">{fmtMoney(Math.max(0, totalBudget - totalSpent))}</div>
          <div className={`stat-change ${totalSpent > totalBudget ? 'down' : 'up'}`}>{totalSpent > totalBudget ? '⚠️ Over budget' : '✅ On track'}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📋 Category Limits</div>
          {budgetStatus.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🎯</div>
              <div className="empty-text">No limits set yet</div>
              <div className="empty-sub">Tap "+ Set Limit" to control your spending by category</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Set First Limit</button>
            </div>
          ) : budgetStatus.map((b, i) => (
            <div key={b.id} className="cat-card">
              <div className="cat-header">
                <div className="cat-info">
                  <span className="cat-emoji">{b.emoji}</span>
                  <div>
                    <div className="cat-name">{b.category}</div>
                    <div style={{ fontSize: 11, color: b.pct >= 90 ? 'var(--danger)' : b.pct >= 70 ? 'var(--accent4)' : 'var(--success)' }}>
                      {b.pct >= 100 ? '🔴 Over limit!' : b.pct >= 70 ? '⚡ Getting close' : '✅ On track'}
                    </div>
                  </div>
                </div>
                <div className="cat-amounts">
                  <div className="cat-spent" style={{ color: getColor(b.pct, i) }}>{fmtMoney(b.spent)}</div>
                  <div className="cat-limit">limit: {fmtMoney(b.limit)}</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: b.pct + '%', background: getColor(b.pct, i) }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{b.pct}% used • {fmtMoney(b.remaining)} left</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDeleteBudget(b.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">📊 Visual Overview</div>
            {budgetStatus.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={110} data={radialData}>
                    <RadialBar dataKey="value" background={{ fill: '#23263a' }} />
                    <Tooltip formatter={v => v + '%'} contentStyle={{ background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 10 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {budgetStatus.map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      {b.category}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Chart will appear once you set budget limits</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">💡 Budget Tips</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🏠', tip: 'Housing should be ≤30% of income' },
                { icon: '🍔', tip: 'Food ideally ≤15% of income' },
                { icon: '🚗', tip: 'Transport ideally ≤10% of income' },
                { icon: '🎯', tip: 'Save at least 20% every month' },
              ].map(t => (
                <div key={t.tip} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text2)' }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">
              {editBudget ? '✏️ Edit Budget Limit' : '🎯 Set Budget Limit'}
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})} disabled={!!editBudget}>
                {(editBudget ? CATEGORIES : availableCats).map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Limit ($)</label>
              <input className="form-input" type="number" placeholder="e.g. 500" value={form.limit} onChange={e => setForm({...form, limit: e.target.value})} autoFocus />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.limit}>Save Limit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

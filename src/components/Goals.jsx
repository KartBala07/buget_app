import { useState } from 'react';
import { fmtMoney } from '../store';

const GOAL_EMOJIS = ['🛡️','✈️','💻','🏠','🚗','💍','📚','🎓','🏋️','🎸','🌴','💰'];

export default function Goals({ data, onAddGoal, onDeleteGoal, onContribute }) {
  const [showModal, setShowModal] = useState(false);
  const [showContrib, setShowContrib] = useState(null);
  const [form, setForm] = useState({ name: '', target: '', saved: '0', emoji: '🛡️', deadline: '' });
  const [contribAmt, setContribAmt] = useState('');

  const handleAdd = () => {
    if (!form.name || !form.target) return;
    onAddGoal({ ...form, target: parseFloat(form.target), saved: parseFloat(form.saved || 0) });
    setShowModal(false);
    setForm({ name: '', target: '', saved: '0', emoji: '🛡️', deadline: '' });
  };

  const handleContrib = () => {
    if (!contribAmt || !showContrib) return;
    onContribute(showContrib, parseFloat(contribAmt));
    setShowContrib(null);
    setContribAmt('');
  };

  const daysLeft = deadline => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Savings Goals</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Track progress toward your financial goals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Goal</button>
      </div>

      {data.goals.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">🎯</div><div className="empty-text">No goals yet</div><div className="empty-sub">Create a savings goal to track your progress</div></div></div>
      ) : (
        <div className="card">
          {data.goals.map(g => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
            const days = daysLeft(g.deadline);
            return (
              <div key={g.id} className="goal-card">
                <div className="goal-icon">{g.emoji}</div>
                <div className="goal-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="goal-name">{g.name}</div>
                    <span style={{ fontSize: 12, color: pct >= 100 ? 'var(--success)' : days && days < 30 ? 'var(--danger)' : 'var(--text2)' }}>
                      {pct >= 100 ? '🎉 Completed!' : days !== null ? `${days}d left` : ''}
                    </span>
                  </div>
                  <div className="goal-bar">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: pct + '%', background: pct >= 100 ? 'var(--success)' : pct >= 70 ? 'var(--accent3)' : 'var(--accent)' }} />
                    </div>
                  </div>
                  <div className="goal-meta">
                    <span>{fmtMoney(g.saved)} saved</span>
                    <span>{pct}% of {fmtMoney(g.target)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowContrib(g.id)}>+ Add</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDeleteGoal(g.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Create Goal <button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="form-group">
              <label className="form-label">Goal Name</label>
              <input className="form-input" placeholder="e.g. Emergency Fund" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Target Amount ($)</label>
                <input className="form-input" type="number" placeholder="10000" value={form.target} onChange={e => setForm({...form, target: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Already Saved ($)</label>
                <input className="form-input" type="number" placeholder="0" value={form.saved} onChange={e => setForm({...form, saved: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {GOAL_EMOJIS.map(e => (
                  <div key={e} onClick={() => setForm({...form, emoji: e})}
                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, borderRadius: 8, border: `2px solid ${form.emoji === e ? 'var(--accent)' : 'var(--border)'}`, background: form.emoji === e ? 'rgba(108,99,255,0.1)' : 'var(--bg3)' }}>
                    {e}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline (optional)</label>
              <input className="form-input" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Create Goal</button>
            </div>
          </div>
        </div>
      )}

      {showContrib && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowContrib(null)}>
          <div className="modal" style={{ width: 360 }}>
            <div className="modal-title">Add Contribution <button className="modal-close" onClick={() => setShowContrib(null)}>✕</button></div>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input className="form-input" type="number" placeholder="100" value={contribAmt} onChange={e => setContribAmt(e.target.value)} autoFocus />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowContrib(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleContrib}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { loadData, saveData, decodeShareData } from './store';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Suggestions from './components/Suggestions';
import AIAdvisor from './components/AIAdvisor';
import Tutorial from './components/Tutorial';
import ShareModal from './components/ShareModal';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '💸' },
  { id: 'budget', label: 'Budget', icon: '🎯' },
  { id: 'goals', label: 'Goals', icon: '🏆' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡' },
  { id: 'ai', label: 'AI Advisor', icon: '🤖' },
];

// Bottom nav shows most-used 5
const BOTTOM_NAV = ['dashboard', 'transactions', 'budget', 'goals', 'ai'];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState(loadData);
  const [showAddTx, setShowAddTx] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const update = useCallback(fn => {
    setData(prev => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const addTransaction = useCallback(tx => {
    update(prev => ({ ...prev, transactions: [...prev.transactions, { ...tx, id: prev.nextId }], nextId: prev.nextId + 1 }));
  }, [update]);

  const deleteTransaction = useCallback(id => {
    update(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  }, [update]);

  const addBudget = useCallback(b => {
    update(prev => ({ ...prev, budgets: [...prev.budgets.filter(x => x.category !== b.category), { ...b, id: prev.nextId }], nextId: prev.nextId + 1 }));
  }, [update]);

  const deleteBudget = useCallback(id => {
    update(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  }, [update]);

  const addGoal = useCallback(g => {
    update(prev => ({ ...prev, goals: [...prev.goals, { ...g, id: prev.nextId }], nextId: prev.nextId + 1 }));
  }, [update]);

  const deleteGoal = useCallback(id => {
    update(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  }, [update]);

  const contributeGoal = useCallback((id, amount) => {
    update(prev => ({ ...prev, goals: prev.goals.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g) }));
  }, [update]);

  const finishTutorial = useCallback(() => {
    update(prev => ({ ...prev, tutorialDone: true }));
  }, [update]);

  const setUserName = useCallback(name => {
    update(prev => ({ ...prev, userName: name }));
  }, [update]);

  const importData = useCallback(imported => {
    update(prev => ({
      ...prev,
      transactions: imported.transactions || [],
      budgets: imported.budgets || [],
      goals: imported.goals || [],
      userName: imported.userName || prev.userName,
    }));
    setShowShare(false);
  }, [update]);

  const navigate = id => { setPage(id); setSidebarOpen(false); };
  const initials = data.userName ? data.userName[0].toUpperCase() : 'U';

  return (
    <div className="app">
      {!data.tutorialDone && (
        <Tutorial onDone={finishTutorial} onSetName={setUserName} />
      )}

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span>💰</span>
          <span>Budget<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>
        {data.userName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 20px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{initials}</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{data.userName}</span>
          </div>
        )}
        <div className="nav-section">Menu</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
        <div className="sidebar-spacer" />
        <div style={{ padding: '16px 8px 0', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginBottom: 8 }} onClick={() => { setSidebarOpen(false); setShowShare(true); }}>
            📤 Share / Import
          </button>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginBottom: 8 }} onClick={() => { update(prev => ({ ...prev, tutorialDone: false })); setSidebarOpen(false); }}>
            ❓ Tutorial
          </button>
          <div style={{ fontSize: 11, color: 'var(--text2)', paddingTop: 8, textAlign: 'center' }}>🔒 Data stored on this device</div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="6" x2="20" y2="6"/><line x1="2" y1="11" x2="20" y2="11"/><line x1="2" y1="16" x2="20" y2="16"/>
              </svg>
            </button>
            <div className="topbar-title">{NAV.find(n => n.id === page)?.icon} {NAV.find(n => n.id === page)?.label}</div>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowShare(true)}>📤 Share</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setPage('transactions'); setShowAddTx(true); }}>+ Add</button>
            <div className="avatar" title={data.userName || 'You'}>{initials}</div>
          </div>
        </div>

        <div className="content">
          {page === 'dashboard' && <Dashboard data={data} onAddTx={() => { setPage('transactions'); setShowAddTx(true); }} />}
          {page === 'transactions' && <Transactions data={data} onAdd={addTransaction} onDelete={deleteTransaction} openModal={showAddTx} onModalClose={() => setShowAddTx(false)} />}
          {page === 'budget' && <Budget data={data} onAddBudget={addBudget} onDeleteBudget={deleteBudget} />}
          {page === 'goals' && <Goals data={data} onAddGoal={addGoal} onDeleteGoal={deleteGoal} onContribute={contributeGoal} />}
          {page === 'suggestions' && <Suggestions data={data} />}
          {page === 'ai' && <AIAdvisor data={data} />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map(id => {
            const n = NAV.find(x => x.id === id);
            return (
              <div key={id} className={`bottom-nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)}>
                <span>{n.icon}</span>
                <span>{n.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </nav>

      {showShare && <ShareModal data={data} onImport={importData} onClose={() => setShowShare(false)} />}
    </div>
  );
}

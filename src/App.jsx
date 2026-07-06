import { useState, useCallback, useEffect } from 'react';
import { loadData, saveData } from './store';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Suggestions from './components/Suggestions';
import AIAdvisor from './components/AIAdvisor';
import Tutorial from './components/Tutorial';
import ShareModal from './components/ShareModal';
import LoadingScreen from './components/LoadingScreen';
import './index.css';

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '📊' },
  { id: 'transactions', label: 'Transactions',  icon: '💸' },
  { id: 'budget',       label: 'Budget',        icon: '🎯' },
  { id: 'goals',        label: 'Goals',         icon: '🏆' },
  { id: 'suggestions',  label: 'Suggestions',   icon: '💡' },
  { id: 'ai',           label: 'AI Advisor',    icon: '🤖' },
];

const BOTTOM_NAV = ['dashboard', 'transactions', 'budget', 'goals', 'ai'];

export default function App() {
  const [loaded, setLoaded]         = useState(false);
  const [page, setPage]             = useState('dashboard');
  const [data, setData]             = useState(loadData);
  const [showAddTx, setShowAddTx]   = useState(false);
  const [sidebarOpen, setSideOpen]  = useState(false);
  const [showShare, setShowShare]   = useState(false);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setSideOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const update = useCallback(fn => {
    setData(prev => { const next = fn(prev); saveData(next); return next; });
  }, []);

  const addTransaction  = useCallback(tx  => update(p => ({ ...p, transactions: [...p.transactions, { ...tx, id: p.nextId }], nextId: p.nextId + 1 })), [update]);
  const deleteTx        = useCallback(id  => update(p => ({ ...p, transactions: p.transactions.filter(t => t.id !== id) })), [update]);
  const addBudget       = useCallback(b   => update(p => ({ ...p, budgets: [...p.budgets.filter(x => x.category !== b.category), { ...b, id: p.nextId }], nextId: p.nextId + 1 })), [update]);
  const deleteBudget    = useCallback(id  => update(p => ({ ...p, budgets: p.budgets.filter(b => b.id !== id) })), [update]);
  const addGoal         = useCallback(g   => update(p => ({ ...p, goals: [...p.goals, { ...g, id: p.nextId }], nextId: p.nextId + 1 })), [update]);
  const deleteGoal      = useCallback(id  => update(p => ({ ...p, goals: p.goals.filter(g => g.id !== id) })), [update]);
  const contributeGoal  = useCallback((id, amt) => update(p => ({ ...p, goals: p.goals.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amt) } : g) })), [update]);
  const finishTutorial  = useCallback(() => update(p => ({ ...p, tutorialDone: true })), [update]);
  const setUserName     = useCallback(name => update(p => ({ ...p, userName: name })), [update]);

  const importData = useCallback(imported => {
    update(p => ({
      ...p,
      transactions: imported.transactions || [],
      budgets:      imported.budgets      || [],
      goals:        imported.goals        || [],
      userName:     imported.userName     || p.userName,
    }));
    setShowShare(false);
  }, [update]);

  const navigate = id => { setPage(id); setSideOpen(false); };
  const initials = data.userName ? data.userName[0].toUpperCase() : '💰';

  if (!loaded) return <LoadingScreen onDone={() => setLoaded(true)} />;

  return (
    <div className="app">
      {/* Tutorial */}
      {!data.tutorialDone && <Tutorial onDone={finishTutorial} onSetName={setUserName} />}

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSideOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span>💰</span>
          <span className="sidebar-logo-text">Budget<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>

        {data.userName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 18px', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{data.userName[0].toUpperCase()}</div>
            <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.userName}</span>
          </div>
        )}

        <div className="nav-section">Menu</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </div>
        ))}

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => { setSideOpen(false); setShowShare(true); }}>
            📤 Share / Import
          </button>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => { update(p => ({ ...p, tutorialDone: false })); setSideOpen(false); }}>
            ❓ Tutorial
          </button>
          <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', paddingTop: 4 }}>🔒 Private · stored on device</div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSideOpen(o => !o)} aria-label="Menu">
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="1" y1="1" x2="21" y2="1"/>
                <line x1="1" y1="9" x2="21" y2="9"/>
                <line x1="1" y1="17" x2="21" y2="17"/>
              </svg>
            </button>
            <div className="topbar-title">{NAV.find(n => n.id === page)?.icon} {NAV.find(n => n.id === page)?.label}</div>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm share-btn" onClick={() => setShowShare(true)}>📤 Share</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setPage('transactions'); setShowAddTx(true); }}>+ Add</button>
            <div className="avatar" onClick={() => setSideOpen(o => !o)} title={data.userName || 'Menu'}>{initials}</div>
          </div>
        </div>

        {/* Page content */}
        <div className="content">
          {page === 'dashboard'    && <Dashboard    data={data} onAddTx={() => { setPage('transactions'); setShowAddTx(true); }} />}
          {page === 'transactions' && <Transactions data={data} onAdd={addTransaction} onDelete={deleteTx} openModal={showAddTx} onModalClose={() => setShowAddTx(false)} />}
          {page === 'budget'       && <Budget       data={data} onAddBudget={addBudget} onDeleteBudget={deleteBudget} />}
          {page === 'goals'        && <Goals        data={data} onAddGoal={addGoal} onDeleteGoal={deleteGoal} onContribute={contributeGoal} />}
          {page === 'suggestions'  && <Suggestions  data={data} />}
          {page === 'ai'           && <AIAdvisor    data={data} />}
        </div>
      </main>

      {/* Bottom nav (mobile only) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map(id => {
            const n = NAV.find(x => x.id === id);
            return (
              <div key={id} className={`bottom-nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)}>
                <span className="bnav-icon">{n.icon}</span>
                <span>{n.label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Share modal */}
      {showShare && <ShareModal data={data} onImport={importData} onClose={() => setShowShare(false)} />}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { loadData, saveData } from './store';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import Goals from './components/Goals';
import Suggestions from './components/Suggestions';
import AIAdvisor from './components/AIAdvisor';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '💸' },
  { id: 'budget', label: 'Budget', icon: '🎯' },
  { id: 'goals', label: 'Goals', icon: '🏆' },
  { id: 'suggestions', label: 'Suggestions', icon: '💡' },
  { id: 'ai', label: 'AI Advisor', icon: '🤖' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState(loadData);
  const [showAddTx, setShowAddTx] = useState(false);

  const update = useCallback(fn => {
    setData(prev => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const addTransaction = useCallback((tx) => {
    update(prev => ({
      ...prev,
      transactions: [...prev.transactions, { ...tx, id: prev.nextId }],
      nextId: prev.nextId + 1,
    }));
  }, [update]);

  const deleteTransaction = useCallback((id) => {
    update(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  }, [update]);

  const addBudget = useCallback((b) => {
    update(prev => ({
      ...prev,
      budgets: [...prev.budgets.filter(x => x.category !== b.category), { ...b, id: prev.nextId }],
      nextId: prev.nextId + 1,
    }));
  }, [update]);

  const deleteBudget = useCallback((id) => {
    update(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  }, [update]);

  const addGoal = useCallback((g) => {
    update(prev => ({
      ...prev,
      goals: [...prev.goals, { ...g, id: prev.nextId }],
      nextId: prev.nextId + 1,
    }));
  }, [update]);

  const deleteGoal = useCallback((id) => {
    update(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  }, [update]);

  const contributeGoal = useCallback((id, amount) => {
    update(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g),
    }));
  }, [update]);

  const pageTitle = NAV.find(n => n.id === page)?.label || 'Dashboard';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>💰</span>
          <span>Budget<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>
        <div className="nav-section">Menu</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
        <div className="sidebar-spacer" />
        <div style={{ padding: '16px 8px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Data stored locally</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>🔒 Private & secure</div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{NAV.find(n => n.id === page)?.icon} {pageTitle}</div>
          <div className="topbar-right">
            <button className="btn btn-primary btn-sm" onClick={() => { setPage('transactions'); setShowAddTx(true); }}>+ Add Transaction</button>
            <div className="avatar">U</div>
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
    </div>
  );
}

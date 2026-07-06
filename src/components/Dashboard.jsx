import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { fmtMoney, fmtDate } from '../store';

const COLORS = ['#6c63ff', '#ff6584', '#43e97b', '#f7971e', '#38bdf8', '#a78bfa'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: '#9095b8', fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>{p.name}: {fmtMoney(p.value)}</p>
      ))}
    </div>
  );
};

export default function Dashboard({ data, onAddTx }) {
  const { transactions, budgets } = data;

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, savings: income > 0 ? Math.round(((income - expense) / income) * 100) : 0 };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const m = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!months[m]) months[m] = { month: m, income: 0, expense: 0 };
      months[m][t.type] += t.amount;
    });
    return Object.values(months).slice(-6);
  }, [transactions]);

  const pieData = useMemo(() => {
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [transactions]);

  const recentTx = useMemo(() => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6), [transactions]);

  const budgetStatus = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
      return { ...b, spent, pct: Math.min(100, Math.round((spent / b.limit) * 100)) };
    });
  }, [budgets, transactions]);

  const isEmpty = transactions.length === 0;

  return (
    <div>
      {isEmpty && (
        <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: '28px 20px', borderColor: 'var(--accent)', background: 'rgba(108,99,255,0.05)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Welcome! Let's get started</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 18 }}>Add your first transaction to see charts and insights here.</div>
          <button className="btn btn-primary" onClick={onAddTx}>+ Add First Transaction</button>
        </div>
      )}

      <div className="grid-4">
        <div className="stat-card balance">
          <div className="stat-label">Balance</div>
          <div className="stat-value balance">{fmtMoney(stats.balance)}</div>
          <div className={`stat-change ${stats.balance >= 0 ? 'up' : 'down'}`}>{stats.balance >= 0 ? '↑ Net positive' : '↓ Spending more than income'}</div>
        </div>
        <div className="stat-card income">
          <div className="stat-label">Income</div>
          <div className="stat-value income">{fmtMoney(stats.income)}</div>
          <div className="stat-change">{transactions.filter(t => t.type === 'income').length} entries</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Expenses</div>
          <div className="stat-value expense">{fmtMoney(stats.expense)}</div>
          <div className={`stat-change ${stats.expense < stats.income ? 'up' : 'down'}`}>{stats.income > 0 ? Math.round((stats.expense / stats.income) * 100) : 0}% of income</div>
        </div>
        <div className="stat-card saving">
          <div className="stat-label">Savings Rate</div>
          <div className="stat-value saving">{stats.savings}%</div>
          <div className={`stat-change ${stats.savings >= 20 ? 'up' : 'down'}`}>{stats.savings >= 20 ? '✓ Healthy' : 'Goal: 20%'}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📊 Income vs Expenses</div>
          {monthlyData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 13 }}>Chart appears after you add transactions</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4}>
                <XAxis dataKey="month" tick={{ fill: '#9095b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9095b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#43e97b" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ff4757" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="card-title">🥧 Spending by Category</div>
          {pieData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 13 }}>Appears after you log expenses</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 10 }} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#9095b8', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span>🕐 Recent Transactions</span>
            <button className="btn btn-primary btn-sm" onClick={onAddTx}>+ Add</button>
          </div>
          {recentTx.length === 0 ? (
            <div className="empty" style={{ padding: '20px 0' }}>
              <div className="empty-icon" style={{ fontSize: 32 }}>💸</div>
              <div className="empty-text" style={{ fontSize: 14 }}>No transactions yet</div>
            </div>
          ) : (
            <div className="tx-list">
              {recentTx.map(tx => (
                <div key={tx.id} className="tx-item">
                  <div className="tx-icon" style={{ background: tx.type === 'income' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)' }}>{tx.emoji}</div>
                  <div className="tx-info">
                    <div className="tx-name">{tx.name}</div>
                    <div className="tx-cat">{tx.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`tx-amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmtMoney(tx.amount)}
                    </div>
                    <div className="tx-date">{fmtDate(tx.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">🎯 Budget Progress</div>
          {budgetStatus.length === 0 ? (
            <div className="empty" style={{ padding: '20px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No budgets set</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Set limits in the Budget tab</div>
            </div>
          ) : budgetStatus.map(b => (
            <div key={b.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{b.emoji} {b.category}</span>
                <span style={{ fontSize: 12, color: b.pct >= 90 ? 'var(--danger)' : 'var(--text2)' }}>
                  {fmtMoney(b.spent)} / {fmtMoney(b.limit)}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: b.pct + '%', background: b.pct >= 90 ? 'var(--danger)' : b.pct >= 70 ? 'var(--accent4)' : 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

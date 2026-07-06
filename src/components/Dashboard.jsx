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
      const m = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!months[m]) months[m] = { month: m, income: 0, expense: 0 };
      months[m][t.type] += t.amount;
    });
    return Object.values(months);
  }, [transactions]);

  const pieData = useMemo(() => {
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 6);
  }, [transactions]);

  const recentTx = useMemo(() => [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 6), [transactions]);

  const budgetStatus = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((s,t) => s+t.amount, 0);
      return { ...b, spent, pct: Math.min(100, Math.round((spent / b.limit) * 100)) };
    });
  }, [budgets, transactions]);

  return (
    <div>
      <div className="grid-4">
        <div className="stat-card balance">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value balance">{fmtMoney(stats.balance)}</div>
          <div className={`stat-change ${stats.balance >= 0 ? 'up' : 'down'}`}>{stats.balance >= 0 ? '↑' : '↓'} Net this month</div>
        </div>
        <div className="stat-card income">
          <div className="stat-label">Total Income</div>
          <div className="stat-value income">{fmtMoney(stats.income)}</div>
          <div className="stat-change up">↑ All recorded</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value expense">{fmtMoney(stats.expense)}</div>
          <div className={`stat-change ${stats.expense < stats.income ? 'up' : 'down'}`}>{Math.round((stats.expense/Math.max(stats.income,1))*100)}% of income</div>
        </div>
        <div className="stat-card saving">
          <div className="stat-label">Savings Rate</div>
          <div className="stat-value saving">{stats.savings}%</div>
          <div className={`stat-change ${stats.savings >= 20 ? 'up' : 'down'}`}>{stats.savings >= 20 ? '✓ Healthy' : '↓ Improve savings'}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📊 Income vs Expenses</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#9095b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9095b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#43e97b" radius={[6,6,0,0]} name="Income" />
              <Bar dataKey="expense" fill="#ff4757" radius={[6,6,0,0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">🥧 Spending by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 10 }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#9095b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span>🕐 Recent Transactions</span>
            <button className="btn btn-primary btn-sm" onClick={onAddTx}>+ Add</button>
          </div>
          <div className="tx-list">
            {recentTx.map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: tx.type === 'income' ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)' }}>{tx.emoji}</div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name}</div>
                  <div className="tx-cat">{tx.category}</div>
                </div>
                <div>
                  <div className={`tx-amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmtMoney(tx.amount)}
                  </div>
                  <div className="tx-date">{fmtDate(tx.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">🎯 Budget Progress</div>
          {budgetStatus.map(b => (
            <div key={b.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{b.emoji} {b.category}</span>
                <span style={{ fontSize: 12, color: b.pct >= 90 ? 'var(--danger)' : '#9095b8' }}>
                  {fmtMoney(b.spent)} / {fmtMoney(b.limit)}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: b.pct + '%',
                  background: b.pct >= 90 ? 'var(--danger)' : b.pct >= 70 ? 'var(--accent4)' : 'var(--accent)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

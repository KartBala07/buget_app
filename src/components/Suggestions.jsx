import { useMemo } from 'react';
import { fmtMoney } from '../store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function analyzeBudget(data) {
  const suggestions = [];
  const { transactions, budgets, goals } = data;

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  if (savingsRate < 10) {
    suggestions.push({ type: 'danger', icon: '🚨', title: 'Low Savings Rate', desc: `You're only saving ${savingsRate.toFixed(1)}% of your income. Financial experts recommend saving at least 20%. Try cutting discretionary spending to boost your rate.` });
  } else if (savingsRate < 20) {
    suggestions.push({ type: 'warning', icon: '⚡', title: 'Savings Rate Could Be Better', desc: `You're saving ${savingsRate.toFixed(1)}% of your income. Try to reach 20% to build a solid financial cushion.` });
  } else {
    suggestions.push({ type: 'success', icon: '✅', title: 'Great Savings Rate!', desc: `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income. Consider investing the surplus to grow your wealth.` });
  }

  const catSpend = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });

  budgets.forEach(b => {
    const spent = catSpend[b.category] || 0;
    const pct = (spent / b.limit) * 100;
    if (pct >= 100) {
      suggestions.push({ type: 'danger', icon: '🔴', title: `Over Budget: ${b.category}`, desc: `You've exceeded your ${b.category} budget by ${fmtMoney(spent - b.limit)}. Consider adjusting your spending or increasing the budget limit.` });
    } else if (pct >= 80) {
      suggestions.push({ type: 'warning', icon: '⚠️', title: `${b.category} Budget Warning`, desc: `You've used ${pct.toFixed(0)}% of your ${b.category} budget. Only ${fmtMoney(b.limit - spent)} remaining this month.` });
    }
  });

  const foodSpend = catSpend['Food'] || 0;
  if (income > 0 && foodSpend / income > 0.3) {
    suggestions.push({ type: 'warning', icon: '🍔', title: 'High Food Spending', desc: `You're spending ${((foodSpend/income)*100).toFixed(0)}% of income on food. Try meal prepping or cooking at home to reduce costs by up to 40%.` });
  }

  const entertainmentSpend = catSpend['Entertainment'] || 0;
  if (entertainmentSpend > 200) {
    suggestions.push({ type: 'warning', icon: '🎬', title: 'Entertainment Spending', desc: `You spent ${fmtMoney(entertainmentSpend)} on entertainment. Review subscriptions you may not be using — the average household wastes $200+/month on unused services.` });
  }

  if (goals.length > 0) {
    const urgentGoal = goals.find(g => {
      if (!g.deadline) return false;
      const days = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return days < 90 && g.saved < g.target;
    });
    if (urgentGoal) {
      const days = Math.ceil((new Date(urgentGoal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      const needed = (urgentGoal.target - urgentGoal.saved) / Math.max(1, days / 30);
      suggestions.push({ type: 'warning', icon: '🎯', title: `Goal Deadline Approaching: ${urgentGoal.name}`, desc: `You need to save ${fmtMoney(needed)}/month to reach your "${urgentGoal.name}" goal before the deadline in ${days} days.` });
    }
  }

  if (income > 0 && expense / income < 0.5) {
    suggestions.push({ type: 'info', icon: '📈', title: 'Investment Opportunity', desc: `You have significant disposable income. Consider investing in index funds or ETFs. Even ${fmtMoney(income * 0.1)}/month invested could grow to substantial wealth over time.` });
  }

  if (suggestions.length < 3) {
    suggestions.push({ type: 'info', icon: '💡', title: '50/30/20 Rule', desc: `A simple budgeting framework: 50% for needs (housing, food, transport), 30% for wants (entertainment, dining out), and 20% for savings & debt. How does your budget compare?` });
  }

  return suggestions;
}

export default function Suggestions({ data }) {
  const suggestions = useMemo(() => analyzeBudget(data), [data]);

  const trendData = useMemo(() => {
    const months = {};
    data.transactions.forEach(t => {
      const m = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!months[m]) months[m] = { month: m, balance: 0 };
      months[m].balance += t.type === 'income' ? t.amount : -t.amount;
    });
    let running = 0;
    return Object.values(months).map(m => { running += m.balance; return { ...m, net: running }; });
  }, [data.transactions]);

  const income = data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Smart Suggestions</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>AI-powered insights based on your spending patterns</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 0 }}>
        <div className="card">
          <div className="card-title">💡 Financial Insights</div>
          {suggestions.map((s, i) => (
            <div key={i} className={`suggestion ${s.type}`}>
              <div className="suggestion-icon">{s.icon}</div>
              <div className="suggestion-text">
                <div className="suggestion-title">{s.title}</div>
                <div className="suggestion-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-title">📈 Net Worth Trend</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#9095b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9095b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v} />
                <Tooltip formatter={v => ['$' + v, 'Net']} contentStyle={{ background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 10 }} />
                <Area type="monotone" dataKey="net" stroke="#6c63ff" fill="url(#netGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-title">📊 Financial Health Score</div>
            {[
              { label: 'Savings Rate', value: income > 0 ? Math.min(100, Math.round(((income-expense)/income)*100)*5) : 0, target: 100 },
              { label: 'Budget Adherence', value: data.budgets.length > 0 ? Math.max(0, 100 - data.budgets.filter(b => { const spent = data.transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((s,t)=>s+t.amount,0); return spent > b.limit; }).length * 20) : 50, target: 100 },
              { label: 'Goal Progress', value: data.goals.length > 0 ? Math.round(data.goals.reduce((s,g) => s + (g.saved/g.target), 0) / data.goals.length * 100) : 0, target: 100 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.value >= 70 ? 'var(--success)' : item.value >= 40 ? 'var(--accent4)' : 'var(--danger)' }}>{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: item.value + '%', background: item.value >= 70 ? 'var(--success)' : item.value >= 40 ? 'var(--accent4)' : 'var(--danger)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

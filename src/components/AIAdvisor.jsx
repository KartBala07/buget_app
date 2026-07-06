import { useState, useRef, useEffect } from 'react';
import { fmtMoney } from '../store';

function buildContext(data) {
  const income = data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const catSpend = {};
  data.transactions.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });
  return { income, expense, balance: income - expense, catSpend, savingsRate: income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0, goals: data.goals, budgets: data.budgets };
}

function getAIResponse(msg, ctx) {
  const lower = msg.toLowerCase();
  const { income, expense, balance, catSpend, savingsRate, goals, budgets } = ctx;

  if (lower.includes('saving') || lower.includes('save')) {
    if (savingsRate < 10) return `Your current savings rate is only ${savingsRate}% — that's quite low. I'd recommend the "pay yourself first" strategy: set up an automatic transfer of at least 10-15% of your income to savings right when you get paid. Based on your income of ${fmtMoney(income)}, try to save at least ${fmtMoney(income * 0.15)} per month. Small wins first: can you reduce your biggest expense category (${Object.entries(catSpend).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'any category'}) by 10%?`;
    return `Great news — you're saving ${savingsRate}% of your income (${fmtMoney(balance)} saved)! To maximize this: 1) Make sure you have 3-6 months of expenses in an emergency fund. 2) Consider maxing out tax-advantaged accounts (401k, IRA). 3) After that, invest in diversified index funds. Your current pace is solid — keep it up!`;
  }

  if (lower.includes('invest') || lower.includes('stock') || lower.includes('etf')) {
    return `Great question about investing! Based on your balance of ${fmtMoney(balance)}, here's a simple framework:\n\n1. **Emergency Fund First**: Aim for 3-6 months of expenses (≈${fmtMoney(expense * 4)})\n2. **Index Funds**: Low-cost S&P 500 ETFs (like VTI or FXAIX) are great for beginners\n3. **Dollar-Cost Average**: Invest a fixed amount monthly regardless of market conditions\n4. **Tax-Advantaged Accounts**: Max out 401(k) employer match first — it's free money!\n\nEven ${fmtMoney(income * 0.1)}/month invested at 7% average returns grows to significant wealth over 30 years.`;
  }

  if (lower.includes('debt') || lower.includes('loan') || lower.includes('credit')) {
    return `For debt management, I recommend the **Avalanche Method** (mathematically optimal):\n\n1. List all debts with their interest rates\n2. Pay minimums on everything\n3. Throw ALL extra money at the highest-interest debt first\n4. Once paid off, roll that payment to the next highest\n\nAlternatively, the **Snowball Method** (psychologically motivating):\n- Pay off smallest balances first for quick wins\n\nWith your current balance of ${fmtMoney(balance)}, you could potentially allocate ${fmtMoney(balance * 0.5)} toward debt acceleration. What's your highest-interest debt?`;
  }

  if (lower.includes('budget') || lower.includes('spend')) {
    const topCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return `Your top spending categories are: ${topCat.map(([cat, amt]) => `${cat} (${fmtMoney(amt)})`).join(', ')}.\n\nI recommend the **50/30/20 rule**:\n- 50% for needs (housing, food, transport): ${fmtMoney(income * 0.5)}/month\n- 30% for wants (entertainment, dining): ${fmtMoney(income * 0.3)}/month\n- 20% for savings/debt: ${fmtMoney(income * 0.2)}/month\n\nYour current expense ratio is ${income > 0 ? ((expense/income)*100).toFixed(0) : 0}% of income. ${expense > income * 0.8 ? '⚠️ You might want to tighten your spending!' : '✅ Looks reasonable!'}`;
  }

  if (lower.includes('goal') || lower.includes('emergency') || lower.includes('fund')) {
    if (goals.length === 0) return `You haven't set any savings goals yet! I recommend starting with:\n\n1. **Emergency Fund** (most important): 3-6 months of expenses ≈ ${fmtMoney(expense * 4)}\n2. **Short-term goal** (1-2 years): vacation, electronics, car repair fund\n3. **Long-term goal** (5+ years): house down payment, retirement\n\nHead to the Goals tab to set these up! Having clear goals makes saving 2x more effective.`;
    const activeGoals = goals.filter(g => g.saved < g.target);
    return `You have ${goals.length} savings goal(s), ${activeGoals.length} still in progress. ${activeGoals.length > 0 ? `To hit your goals on time, try to set aside ${fmtMoney(activeGoals.reduce((s,g)=>s+(g.target-g.saved),0) / 12)} per month across all goals.` : '🎉 All goals completed! Time to set new ones.'} Automate your savings transfers to make it effortless.`;
  }

  if (lower.includes('retire') || lower.includes('retirement')) {
    return `Retirement planning tip: Use the **25x Rule** — you need 25x your annual expenses saved to retire comfortably. With your current spending of ${fmtMoney(expense)}/month (${fmtMoney(expense*12)}/year), you'd need about ${fmtMoney(expense*12*25)} total.\n\nKey steps:\n1. Contribute enough to get your full 401(k) employer match\n2. Then max out a Roth IRA ($7,000/year in 2024)\n3. Then go back and max out 401(k) ($23,000/year)\n4. Invest in low-cost index funds\n\nThe earlier you start, the better — time is your biggest advantage!`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('help') || lower.includes('advice')) {
    return `Hi! I'm your personal AI financial advisor. 👋\n\nI can see you have a balance of ${fmtMoney(balance)} with a ${savingsRate}% savings rate. Here's what I can help with:\n\n• **Savings strategies** — "How can I save more?"\n• **Investment advice** — "Should I invest my savings?"\n• **Budget optimization** — "How do I reduce spending?"\n• **Debt management** — "How should I pay off debt?"\n• **Goal planning** — "How do I save for a house?"\n• **Retirement planning** — "When can I retire?"\n\nWhat would you like to explore?`;
  }

  if (lower.includes('income') || lower.includes('earn') || lower.includes('salary')) {
    return `Your total recorded income is ${fmtMoney(income)}. To increase your income, consider:\n\n1. **Negotiate your salary** — Most people are underpaid. Research market rates on Glassdoor and negotiate at your next review.\n2. **Side hustles** — Freelancing, consulting, or gig work can add 20-30% to your income.\n3. **Passive income** — Dividends, rental income, or digital products work while you sleep.\n4. **Skill development** — Invest in skills that command higher pay in your field.\n\nEven a 10% income increase on ${fmtMoney(income)} = ${fmtMoney(income * 0.1)} more to work with!`;
  }

  return `Thanks for your question about "${msg}"!\n\nBased on your financial snapshot:\n• Income: ${fmtMoney(income)}\n• Expenses: ${fmtMoney(expense)}\n• Balance: ${fmtMoney(balance)}\n• Savings Rate: ${savingsRate}%\n\nI'd suggest focusing on: ${savingsRate < 20 ? 'boosting your savings rate' : 'optimizing your investments'}. Try asking me about budgeting, investing, saving, debt management, or retirement planning for personalized advice!`;
}

export default function AIAdvisor({ data }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello! 👋 I'm your AI financial advisor. I have access to your financial data and can provide personalized advice.\n\nYour current snapshot:\n• Balance: ${fmtMoney(data.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) - data.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0))}\n• ${data.transactions.length} transactions tracked\n• ${data.goals.length} savings goals\n\nHow can I help you today? Ask me about saving, investing, budgeting, or any financial question!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const ctx = buildContext(data);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    setTimeout(() => {
      const response = getAIResponse(text, ctx);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  };

  const quickPrompts = [
    'How can I save more money?',
    'Should I invest my surplus?',
    'How to reduce my expenses?',
    'Help me plan for retirement',
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>AI Financial Advisor</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Get personalized financial advice based on your data</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {quickPrompts.map(p => (
          <div key={p} className="chip" onClick={() => { setInput(p); }}>💬 {p}</div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ai-chat">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className={`msg-avatar ${m.role}`}>{m.role === 'ai' ? '🤖' : '👤'}</div>
                <div className="msg-bubble" style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg ai">
                <div className="msg-avatar ai">🤖</div>
                <div className="msg-bubble">
                  <div className="typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Ask me anything about your finances..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={1}
            />
            <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
              {loading ? '...' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

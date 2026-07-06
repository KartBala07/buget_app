import { useState } from 'react';

const STEPS = [
  { emoji: '👋', title: 'Welcome to BudgetAI!', desc: 'Your smart personal finance app. Track spending, set budgets, plan savings goals, and get AI-powered advice — all private to your device.' },
  { emoji: '💸', title: 'Track Transactions', desc: 'Log every income and expense. Tap "+ Add Transaction" anytime. All your data stays on this device and is never sent anywhere.' },
  { emoji: '🎯', title: 'Set Budget Limits', desc: 'Go to the Budget page to set monthly spending limits per category. You\'ll get alerts when you\'re getting close or over budget.' },
  { emoji: '🏆', title: 'Create Savings Goals', desc: 'Set goals like Emergency Fund, Vacation, or a New Car. Track your progress and add contributions as you save.' },
  { emoji: '🤖', title: 'Ask the AI Advisor', desc: 'The AI Advisor reads your real data and gives personalized advice on saving, investing, budgeting, and more. Try asking it anything!' },
  { emoji: '👨‍👩‍👧', title: 'Share with Family', desc: 'Use the Share button in the top bar to export your data as a code. Family members can import it to their own device — each person keeps their own copy.' },
];

export default function Tutorial({ onDone, userName, onSetName }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const finish = () => {
    if (name.trim()) onSetName(name.trim());
    onDone();
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-step">
          <div className="tutorial-emoji">{STEPS[step].emoji}</div>
          <div className="tutorial-title">{STEPS[step].title}</div>
          <div className="tutorial-desc">{STEPS[step].desc}</div>

          {step === 0 && (
            <div style={{ marginBottom: 20 }}>
              <input
                className="form-input"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </div>
          )}
        </div>

        <div className="tutorial-dots">
          {STEPS.map((_, i) => <div key={i} className={`tutorial-dot ${i === step ? 'active' : ''}`} />)}
        </div>

        <div className="tutorial-actions">
          {!isFirst && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {!isLast && <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>}
          {isLast && <button className="btn btn-primary" onClick={finish}>🚀 Get Started!</button>}
          {step > 0 && <button className="btn btn-ghost btn-sm" onClick={finish} style={{ color: 'var(--text2)', fontSize: 12 }}>Skip</button>}
        </div>
      </div>
    </div>
  );
}

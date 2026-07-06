const KEY = 'budgetapp_data_v2';

const emptyData = () => ({
  transactions: [],
  budgets: [],
  goals: [],
  userName: '',
  nextId: 1,
  tutorialDone: false,
  createdAt: new Date().toISOString().split('T')[0],
});

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (!d.createdAt) d.createdAt = new Date().toISOString().split('T')[0];
      return d;
    }
  } catch {}
  return emptyData();
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// Share: encode full data as base64 URL param
export function encodeShareData(data) {
  const payload = JSON.stringify({ transactions: data.transactions, budgets: data.budgets, goals: data.goals, userName: data.userName });
  return btoa(unescape(encodeURIComponent(payload)));
}

export function decodeShareData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch { return null; }
}

export const CATEGORIES = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Housing', emoji: '🏠' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Health', emoji: '💊' },
  { name: 'Salary', emoji: '💼' },
  { name: 'Freelance', emoji: '💻' },
  { name: 'Investment', emoji: '📈' },
  { name: 'Education', emoji: '📚' },
  { name: 'Utilities', emoji: '💡' },
  { name: 'Other', emoji: '📌' },
];

export function fmtMoney(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const KEY = 'budgetapp_data';

const defaultData = {
  transactions: [
    { id: 1, name: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: '2024-01-05', emoji: '💼' },
    { id: 2, name: 'Rent', amount: 1200, type: 'expense', category: 'Housing', date: '2024-01-06', emoji: '🏠' },
    { id: 3, name: 'Groceries', amount: 320, type: 'expense', category: 'Food', date: '2024-01-08', emoji: '🛒' },
    { id: 4, name: 'Netflix', amount: 15, type: 'expense', category: 'Entertainment', date: '2024-01-09', emoji: '🎬' },
    { id: 5, name: 'Freelance', amount: 800, type: 'income', category: 'Freelance', date: '2024-01-12', emoji: '💻' },
    { id: 6, name: 'Restaurant', amount: 85, type: 'expense', category: 'Food', date: '2024-01-14', emoji: '🍽️' },
    { id: 7, name: 'Gas', amount: 60, type: 'expense', category: 'Transport', date: '2024-01-15', emoji: '⛽' },
    { id: 8, name: 'Gym', amount: 45, type: 'expense', category: 'Health', date: '2024-01-16', emoji: '💪' },
    { id: 9, name: 'Amazon', amount: 130, type: 'expense', category: 'Shopping', date: '2024-01-18', emoji: '📦' },
    { id: 10, name: 'Coffee Shop', amount: 48, type: 'expense', category: 'Food', date: '2024-01-20', emoji: '☕' },
  ],
  budgets: [
    { id: 1, category: 'Food', limit: 500, emoji: '🍔' },
    { id: 2, category: 'Housing', limit: 1500, emoji: '🏠' },
    { id: 3, category: 'Transport', limit: 200, emoji: '🚗' },
    { id: 4, category: 'Entertainment', limit: 100, emoji: '🎮' },
    { id: 5, category: 'Shopping', limit: 300, emoji: '🛍️' },
    { id: 6, category: 'Health', limit: 150, emoji: '💊' },
  ],
  goals: [
    { id: 1, name: 'Emergency Fund', target: 10000, saved: 3500, emoji: '🛡️', deadline: '2024-12-31' },
    { id: 2, name: 'Vacation', target: 3000, saved: 800, emoji: '✈️', deadline: '2024-08-01' },
    { id: 3, name: 'New Laptop', target: 1500, saved: 900, emoji: '💻', deadline: '2024-06-01' },
  ],
  userName: 'User',
  nextId: 11,
};

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultData;
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
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
  { name: 'Other', emoji: '📌' },
];

export function fmtMoney(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

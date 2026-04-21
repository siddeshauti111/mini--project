import React, { useMemo, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { parseCsvText, monthlyTotals, categoryTotals } from './components/utils';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ date: '', category: 'food', description: '', amount: '' });

  const filtered = useMemo(
    () => (filter === 'all' ? expenses : expenses.filter((e) => e.category === filter)),
    [expenses, filter]
  );

  const totalSpending = useMemo(
    () => filtered.reduce((sum, item) => sum + item.amount, 0).toFixed(2),
    [filtered]
  );

  const monthlyData = useMemo(() => monthlyTotals(filtered), [filtered]);
  const pieData = useMemo(() => categoryTotals(filtered), [filtered]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsvText(text);
    setExpenses((prev) => [...prev, ...parsed]);

    const fd = new FormData();
    fd.append('file', file);
    try {
      await axios.post(`${API_URL}/expenses/upload`, fd);
    } catch (error) {
      // non-blocking API upload for demo
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newExpense = {
      id: crypto.randomUUID(),
      date: form.date,
      category: form.category,
      description: form.description,
      amount: Number(form.amount)
    };
    if (!newExpense.date || !newExpense.category || !Number.isFinite(newExpense.amount)) return;
    setExpenses((prev) => [...prev, newExpense]);
    setForm({ date: '', category: 'food', description: '', amount: '' });
  };

  const categories = ['all', ...new Set(expenses.map((e) => e.category))];

  return (
    <div className="app">
      <h1>Expense Tracker Dashboard</h1>
      <p className="subtitle">Upload CSV files, add expenses, and visualize spending trends.</p>

      <section className="card">
        <h2>Add Expense</h2>
        <form className="grid-form" onSubmit={handleAddExpense}>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="food">food</option>
            <option value="travel">travel</option>
            <option value="bills">bills</option>
            <option value="shopping">shopping</option>
            <option value="health">health</option>
          </select>
          <input placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="number" min="0" step="0.01" placeholder="amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <button type="submit">Add Expense</button>
        </form>
      </section>

      <section className="card">
        <h2>Import CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <small>CSV headers: date,category,description,amount</small>
      </section>

      <section className="card controls">
        <label htmlFor="categoryFilter">Filter by category</label>
        <select id="categoryFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="total">Total spending: ${totalSpending}</div>
      </section>

      <section className="charts">
        <div className="card chart-card">
          <h2>Monthly Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h2>Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default App;

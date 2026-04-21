export const parseCsvText = (csvText) => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line, index) => {
    const cols = line.split(',').map((c) => c.trim());
    const row = headers.reduce((acc, key, i) => {
      acc[key] = cols[i] ?? '';
      return acc;
    }, {});

    return {
      id: `${index}-${row.date}-${row.category}`,
      date: row.date,
      category: row.category,
      description: row.description,
      amount: Number(row.amount || 0)
    };
  }).filter((expense) => expense.date && expense.category && Number.isFinite(expense.amount));
};

export const monthlyTotals = (expenses) => {
  const grouped = expenses.reduce((acc, item) => {
    const month = item.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + item.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const categoryTotals = (expenses) => {
  const grouped = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
};

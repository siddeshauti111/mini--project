import { parseCsvText, monthlyTotals, categoryTotals } from './components/utils';

describe('expense utilities', () => {
  test('parseCsvText should parse valid rows and cast amount', () => {
    const csv = `date,category,description,amount\n2026-01-04,food,lunch,14.50\n2026-01-06,travel,bus,7`;
    const rows = parseCsvText(csv);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ category: 'food', amount: 14.5 });
    expect(rows[1]).toMatchObject({ description: 'bus', amount: 7 });
  });

  test('monthlyTotals and categoryTotals should aggregate correctly', () => {
    const expenses = [
      { date: '2026-01-01', category: 'food', amount: 10 },
      { date: '2026-01-16', category: 'food', amount: 20 },
      { date: '2026-02-01', category: 'travel', amount: 30 }
    ];

    expect(monthlyTotals(expenses)).toEqual([
      { month: '2026-01', total: 30 },
      { month: '2026-02', total: 30 }
    ]);

    expect(categoryTotals(expenses)).toEqual(
      expect.arrayContaining([
        { name: 'food', value: 30 },
        { name: 'travel', value: 30 }
      ])
    );
  });
});

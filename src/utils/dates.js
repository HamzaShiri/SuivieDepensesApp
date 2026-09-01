/**
 * Utilitaires de manipulation de dates et calculs statistiques
 */

export const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isThisWeek = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche ou Lundi
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
};

export const isThisMonth = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export const isPreviousMonth = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth();
};

/**
 * Filtre les dépenses selon une plage (7j, 30j, 90j)
 */
export const filterExpensesByRange = (expenses, days) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return expenses.filter(e => new Date(e.date) >= cutoff);
};

/**
 * Calculs statistiques clés
 */
export const calculateMonthlyTotal = (expenses) => {
  return expenses
    .filter(e => isThisMonth(e.date))
    .reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0);
};

export const calculateDailyAverage = (expenses) => {
  const now = new Date();
  const dayOfMonth = now.getDate() || 1;
  const monthlyTotal = calculateMonthlyTotal(expenses);
  return monthlyTotal / dayOfMonth;
};

export const calculateTopCategory = (expenses) => {
  const monthExpenses = expenses.filter(e => isThisMonth(e.date));
  if (monthExpenses.length === 0) return { name: 'Aucune', amount: 0 };

  const categorySums = {};
  monthExpenses.forEach(e => {
    const cat = e.categorie || 'Autres';
    categorySums[cat] = (categorySums[cat] || 0) + parseFloat(e.montant || 0);
  });

  let topCat = 'Autres';
  let maxAmount = -1;

  Object.entries(categorySums).forEach(([cat, sum]) => {
    if (sum > maxAmount) {
      maxAmount = sum;
      topCat = cat;
    }
  });

  return { name: topCat, amount: maxAmount };
};

export const calculateLast7DaysChartData = (expenses) => {
  const days = [];
  const amounts = [];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;
    
    const dayTotal = expenses
      .filter(e => isSameDay(e.date, d))
      .reduce((sum, e) => sum + parseFloat(e.montant || 0), 0);

    days.push(dayLabel);
    amounts.push(dayTotal);
  }

  return { labels: days, data: amounts };
};

export const calculateCategoryPieData = (expenses) => {
  const monthExpenses = expenses.filter(e => isThisMonth(e.date));
  const sums = {};

  monthExpenses.forEach(e => {
    const cat = e.categorie || 'Autres';
    sums[cat] = (sums[cat] || 0) + parseFloat(e.montant || 0);
  });

  return {
    labels: Object.keys(sums),
    data: Object.values(sums)
  };
};

export const formatDateFr = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-TN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

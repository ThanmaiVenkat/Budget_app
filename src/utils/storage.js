// Budget data now lives in Firestore (see src/data/householdRepo.js) and
// syncs across every signed-in device, so there is no local load/save/reset
// path here any more. CSV export is the one thing that still operates purely
// on data already in memory, so it's all that remains in this file.
export const exportTransactionsToCSV = (transactions = [], members = [], categories = []) => {
  const headers = ['Transaction ID', 'Type', 'Description', 'Amount (INR ₹)', 'Category', 'Paid By', 'Date', 'Payment Method', 'Notes'];

  const rows = (transactions || []).map(tx => {
    const member = (members || []).find(m => m.id === tx.memberId)?.name || tx.memberId;
    const category = (categories || []).find(c => c.id === tx.category)?.name || tx.category;
    return [
      tx.id,
      tx.type,
      `"${(tx.title || '').replace(/"/g, '""')}"`,
      (tx.amount || 0).toFixed(2),
      `"${category}"`,
      `"${member}"`,
      tx.date,
      tx.paymentMethod || 'N/A',
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `indian_family_budget_details_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

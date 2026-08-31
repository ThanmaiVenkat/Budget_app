import * as XLSX from 'xlsx';

export const parseExcelSpreadsheet = async (file, existingCategories, existingMembers) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Take first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON objects
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Spreadsheet appears to be empty.');
        }

        // Auto-detect columns
        const sampleRow = rawJson[0];
        const keys = Object.keys(sampleRow);

        const findKey = (candidates) => {
          return keys.find(k => {
            const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            return candidates.some(c => cleanKey.includes(c));
          });
        };

        const titleKey = findKey(['title', 'description', 'item', 'particular', 'name', 'payee', 'detail']) || keys[0];
        const amountKey = findKey(['amount', 'price', 'cost', 'total', 'val', 'rupee', 'inr', 'sum']) || keys[1];
        const categoryKey = findKey(['category', 'head', 'cat', 'group', 'class']);
        const memberKey = findKey(['member', 'person', 'paidby', 'user', 'who', 'name']);
        const dateKey = findKey(['date', 'time', 'day', 'when']);
        const methodKey = findKey(['payment', 'method', 'mode', 'upi']);
        const notesKey = findKey(['note', 'remark', 'comment']);
        const typeKey = findKey(['type', 'kind', 'crdr', 'credit']);

        const parsedTransactions = [];
        const newCategoriesMap = new Map();
        const newMembersMap = new Map();
        const skippedRows = [];

        rawJson.forEach((row, idx) => {
          const sheetRow = idx + 2; // +1 for 0-index, +1 for the header row
          const titleCell = row[titleKey];
          const rawTitle = (titleCell === undefined || titleCell === null ? '' : String(titleCell)).trim();
          if (!rawTitle) {
            skippedRows.push({ row: sheetRow, reason: 'Missing title' });
            return;
          }

          // Clean amount
          let rawAmount = String(row[amountKey] || '0').replace(/[₹,$\s]/g, '');
          let numAmount = Math.abs(parseFloat(rawAmount)) || 0;

          if (numAmount === 0) {
            skippedRows.push({ row: sheetRow, reason: `"${rawTitle}" has no valid amount` });
            return;
          }

          // Determine transaction type (expense vs income)
          let txType = 'expense';
          if (typeKey && String(row[typeKey]).toLowerCase().includes('income')) {
            txType = 'income';
          } else if (parseFloat(rawAmount) < 0) {
            txType = 'expense';
          } else if (rawTitle.toLowerCase().includes('salary') || rawTitle.toLowerCase().includes('credit') || rawTitle.toLowerCase().includes('income')) {
            txType = 'income';
          }

          // Category resolution — income rows always store the literal 'income'
          // category below, so skip creating an unused category for them.
          let catId = 'income';
          if (txType !== 'income') {
            let catName = categoryKey && row[categoryKey] ? String(row[categoryKey]).trim() : 'General';
            let matchedCat = existingCategories.find(c => c.name.toLowerCase() === catName.toLowerCase() || c.id === catName.toLowerCase());

            catId = matchedCat ? matchedCat.id : catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if (!matchedCat && !newCategoriesMap.has(catId)) {
              newCategoriesMap.set(catId, {
                id: catId,
                name: catName,
                icon: '📦',
                limit: 10000,
                color: '#3b82f6'
              });
            }
          }

          // Member resolution — rows with no identifiable member column fall back to
          // the shared "All Family" bucket rather than spawning a fake "Family" member.
          let memName = memberKey && row[memberKey] ? String(row[memberKey]).trim() : '';
          let matchedMem = memName
            ? existingMembers.find(m => m.name.toLowerCase().includes(memName.toLowerCase()) || m.id === memName.toLowerCase())
            : null;

          let memberId = matchedMem ? matchedMem.id : (memName ? memName.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'all');
          if (memName && !matchedMem && !newMembersMap.has(memberId) && memberId !== 'all') {
            newMembersMap.set(memberId, {
              id: memberId,
              name: memName,
              avatar: '👤',
              color: '#10b981',
              role: 'Member',
              allowance: 10000
            });
          }

          // Date resolution
          let dateStr = new Date().toISOString().split('T')[0];
          if (dateKey && row[dateKey]) {
            const rawDate = row[dateKey];
            if (rawDate instanceof Date) {
              dateStr = rawDate.toISOString().split('T')[0];
            } else {
              const parsedDate = new Date(rawDate);
              if (!isNaN(parsedDate.getTime())) {
                dateStr = parsedDate.toISOString().split('T')[0];
              }
            }
          }

          parsedTransactions.push({
            id: 'import-' + Date.now() + '-' + idx,
            type: txType,
            title: rawTitle,
            amount: numAmount,
            category: txType === 'income' ? 'income' : catId,
            memberId,
            date: dateStr,
            paymentMethod: methodKey && row[methodKey] ? String(row[methodKey]) : 'UPI',
            notes: notesKey && row[notesKey] ? String(row[notesKey]) : 'Uploaded via Excel'
          });
        });

        resolve({
          transactions: parsedTransactions,
          newCategories: Array.from(newCategoriesMap.values()),
          newMembers: Array.from(newMembersMap.values()),
          totalRows: parsedTransactions.length,
          skippedRows
        });

      } catch (err) {
        console.error('Excel parsing error:', err);
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const downloadSampleExcelTemplate = () => {
  const sampleData = [
    {
      Date: '2026-07-26',
      Title: 'Supermarket Provisions',
      'Amount (₹)': 4500,
      Type: 'expense',
      Category: 'Groceries & Provisions',
      'Family Member': 'Mom (Priya)',
      'Payment Method': 'UPI',
      Notes: 'Weekly grocery run'
    },
    {
      Date: '2026-07-24',
      Title: 'Electricity Bill BESCOM',
      'Amount (₹)': 3200,
      Type: 'expense',
      Category: 'Electricity & Bills',
      'Family Member': 'Dad (Rajesh)',
      'Payment Method': 'Net Banking',
      Notes: 'Monthly power bill'
    },
    {
      Date: '2026-07-01',
      Title: 'Salary Credit',
      'Amount (₹)': 145000,
      Type: 'income',
      Category: 'Income',
      'Family Member': 'Dad (Rajesh)',
      'Payment Method': 'Transfer',
      Notes: 'Monthly salary deposit'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Family Expenses');
  XLSX.writeFile(workbook, 'Sample_Family_Budget_Template.xlsx');
};

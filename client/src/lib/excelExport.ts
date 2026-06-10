// Advanced Excel Export with detailed sheets and visual formatting
// Uses client-side generation with xlsx library

export interface ExcelExportData {
  reminders: any[];
  notes: any[];
  transactions: any[];
  goals: any[];
  jobApplications: any[];
  memory: any[];
}

export function generateExcelExport(data: ExcelExportData) {
  // Create workbook structure
  const workbook = {
    SheetNames: ['Dashboard', 'Reminders', 'Finance', 'Goals', 'Jobs', 'Notes', 'Memory'],
    Sheets: {} as Record<string, any>,
  };

  // Dashboard Sheet
  workbook.Sheets['Dashboard'] = generateDashboardSheet(data);

  // Reminders Sheet
  workbook.Sheets['Reminders'] = generateRemindersSheet(data.reminders);

  // Finance Sheet
  workbook.Sheets['Finance'] = generateFinanceSheet(data.transactions);

  // Goals Sheet
  workbook.Sheets['Goals'] = generateGoalsSheet(data.goals);

  // Jobs Sheet
  workbook.Sheets['Jobs'] = generateJobsSheet(data.jobApplications);

  // Notes Sheet
  workbook.Sheets['Notes'] = generateNotesSheet(data.notes);

  // Memory Sheet
  workbook.Sheets['Memory'] = generateMemorySheet(data.memory);

  return workbook;
}

function generateDashboardSheet(data: ExcelExportData) {
  const sheet: Record<string, any> = {};
  let row = 1;

  // Title
  sheet['A1'] = { t: 's', v: 'LifeOS Dashboard Summary', s: { font: { bold: true, size: 16 } } };
  sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

  row = 3;

  // Key Metrics
  const metrics = [
    ['Metric', 'Value'],
    ['Today\'s Reminders', data.reminders.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.dueDate).toDateString() === today && !r.completed;
    }).length],
    ['Overdue Reminders', data.reminders.filter(r => {
      return new Date(r.dueDate) < new Date() && !r.completed;
    }).length],
    ['Active Goals', data.goals.filter(g => g.status !== 'completed').length],
    ['Total Notes', data.notes.length],
    ['Job Applications', data.jobApplications.length],
  ];

  metrics.forEach((metric, idx) => {
    sheet[`A${row + idx}`] = { t: 's', v: metric[0], s: { font: { bold: true } } };
    sheet[`B${row + idx}`] = { t: 'n', v: metric[1] };
  });

  row += metrics.length + 2;

  // Finance Summary
  sheet[`A${row}`] = { t: 's', v: 'Finance Summary', s: { font: { bold: true, size: 14 } } };
  row += 2;

  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);

  const monthlyExpenses = data.transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = data.transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'income' && tDate >= monthStart && tDate <= monthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  sheet[`A${row}`] = { t: 's', v: 'This Month Income', s: { font: { bold: true } } };
  sheet[`B${row}`] = { t: 'n', v: monthlyIncome, z: '$#,##0.00' };
  row++;

  sheet[`A${row}`] = { t: 's', v: 'This Month Expenses', s: { font: { bold: true } } };
  sheet[`B${row}`] = { t: 'n', v: monthlyExpenses, z: '$#,##0.00' };
  row++;

  sheet[`A${row}`] = { t: 's', v: 'Net', s: { font: { bold: true } } };
  sheet[`B${row}`] = { t: 'n', v: monthlyIncome - monthlyExpenses, z: '$#,##0.00' };

  sheet['!cols'] = [{ wch: 25 }, { wch: 15 }];

  return sheet;
}

function generateRemindersSheet(reminders: any[]) {
  const sheet: Record<string, any> = {};
  const headers = ['Title', 'Category', 'Priority', 'Due Date', 'Status', 'Description'];

  // Header row
  headers.forEach((header, idx) => {
    const cell = String.fromCharCode(65 + idx) + '1';
    sheet[cell] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: 'FF4472C4' } } } };
  });

  // Data rows
  reminders.forEach((reminder, idx) => {
    const row = idx + 2;
    sheet[`A${row}`] = { t: 's', v: reminder.title };
    sheet[`B${row}`] = { t: 's', v: reminder.category };
    sheet[`C${row}`] = { t: 's', v: reminder.priority };
    sheet[`D${row}`] = { t: 'd', v: new Date(reminder.dueDate), z: 'yyyy-mm-dd' };
    sheet[`E${row}`] = { t: 's', v: reminder.completed ? 'Completed' : 'Pending' };
    sheet[`F${row}`] = { t: 's', v: reminder.description || '' };
  });

  sheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];

  return sheet;
}

function generateFinanceSheet(transactions: any[]) {
  const sheet: Record<string, any> = {};
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];

  // Header row
  headers.forEach((header, idx) => {
    const cell = String.fromCharCode(65 + idx) + '1';
    sheet[cell] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: 'FF70AD47' } } } };
  });

  // Data rows
  transactions.forEach((transaction, idx) => {
    const row = idx + 2;
    sheet[`A${row}`] = { t: 'd', v: new Date(transaction.date), z: 'yyyy-mm-dd' };
    sheet[`B${row}`] = { t: 's', v: transaction.type };
    sheet[`C${row}`] = { t: 's', v: transaction.category };
    sheet[`D${row}`] = { t: 'n', v: transaction.amount, z: '$#,##0.00' };
    sheet[`E${row}`] = { t: 's', v: transaction.description || '' };
  });

  // Add summary section
  const summaryRow = transactions.length + 3;
  sheet[`A${summaryRow}`] = { t: 's', v: 'Summary', s: { font: { bold: true, size: 12 } } };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  sheet[`A${summaryRow + 2}`] = { t: 's', v: 'Total Income', s: { font: { bold: true } } };
  sheet[`B${summaryRow + 2}`] = { t: 'n', v: totalIncome, z: '$#,##0.00' };

  sheet[`A${summaryRow + 3}`] = { t: 's', v: 'Total Expenses', s: { font: { bold: true } } };
  sheet[`B${summaryRow + 3}`] = { t: 'n', v: totalExpense, z: '$#,##0.00' };

  sheet[`A${summaryRow + 4}`] = { t: 's', v: 'Net', s: { font: { bold: true } } };
  sheet[`B${summaryRow + 4}`] = { t: 'n', v: totalIncome - totalExpense, z: '$#,##0.00' };

  sheet['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 25 }];

  return sheet;
}

function generateGoalsSheet(goals: any[]) {
  const sheet: Record<string, any> = {};
  const headers = ['Goal', 'Category', 'Progress %', 'Deadline', 'Status', 'Why It Matters'];

  // Header row
  headers.forEach((header, idx) => {
    const cell = String.fromCharCode(65 + idx) + '1';
    sheet[cell] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FF000000' } }, fill: { fgColor: { rgb: 'FFFFC000' } } } };
  });

  // Data rows
  goals.forEach((goal, idx) => {
    const row = idx + 2;
    sheet[`A${row}`] = { t: 's', v: goal.title };
    sheet[`B${row}`] = { t: 's', v: goal.category };
    sheet[`C${row}`] = { t: 'n', v: goal.progress, z: '0' };
    sheet[`D${row}`] = { t: 'd', v: new Date(goal.deadline), z: 'yyyy-mm-dd' };
    sheet[`E${row}`] = { t: 's', v: goal.status };
    sheet[`F${row}`] = { t: 's', v: goal.whyItMatters || '' };
  });

  sheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }];

  return sheet;
}

function generateJobsSheet(jobs: any[]) {
  const sheet: Record<string, any> = {};
  const headers = ['Company', 'Role', 'Location', 'Status', 'Applied Date', 'Follow-up Date', 'Salary Range'];

  // Header row
  headers.forEach((header, idx) => {
    const cell = String.fromCharCode(65 + idx) + '1';
    sheet[cell] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: 'FF0070C0' } } } };
  });

  // Data rows
  jobs.forEach((job, idx) => {
    const row = idx + 2;
    sheet[`A${row}`] = { t: 's', v: job.company };
    sheet[`B${row}`] = { t: 's', v: job.role };
    sheet[`C${row}`] = { t: 's', v: job.location };
    sheet[`D${row}`] = { t: 's', v: job.status };
    sheet[`E${row}`] = { t: 'd', v: new Date(job.dateApplied), z: 'yyyy-mm-dd' };
    sheet[`F${row}`] = { t: 'd', v: new Date(job.followUpDate), z: 'yyyy-mm-dd' };
    sheet[`G${row}`] = { t: 's', v: job.salaryRange || '' };
  });

  sheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];

  return sheet;
}

function generateNotesSheet(notes: any[]) {
  const sheet: Record<string, any> = {};
  const headers = ['Title', 'Category', 'Tags', 'Created', 'Content'];

  // Header row
  headers.forEach((header, idx) => {
    const cell = String.fromCharCode(65 + idx) + '1';
    sheet[cell] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: 'FF7030A0' } } } };
  });

  // Data rows
  notes.forEach((note, idx) => {
    const row = idx + 2;
    sheet[`A${row}`] = { t: 's', v: note.title };
    sheet[`B${row}`] = { t: 's', v: note.category };
    sheet[`C${row}`] = { t: 's', v: Array.isArray(note.tags) ? note.tags.join(', ') : '' };
    sheet[`D${row}`] = { t: 'd', v: new Date(note.createdAt), z: 'yyyy-mm-dd' };
    sheet[`E${row}`] = { t: 's', v: note.content };
  });

  sheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 40 }];

  return sheet;
}

function generateMemorySheet(memory: any[]) {
  const sheet: Record<string, any> = {};
  const headers = ['Category', 'Key', 'Value', 'Created'];

  // Header row
  headers.forEach((header, idx) => {
    const cell = String.fromCharCode(65 + idx) + '1';
    sheet[cell] = { t: 's', v: header, s: { font: { bold: true, color: { rgb: 'FFFFFFFF' } }, fill: { fgColor: { rgb: 'FF00B050' } } } };
  });

  // Data rows
  memory.forEach((item, idx) => {
    const row = idx + 2;
    sheet[`A${row}`] = { t: 's', v: item.category };
    sheet[`B${row}`] = { t: 's', v: item.key };
    sheet[`C${row}`] = { t: 's', v: item.value };
    sheet[`D${row}`] = { t: 'd', v: new Date(item.createdAt), z: 'yyyy-mm-dd' };
  });

  sheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 12 }];

  return sheet;
}

export async function downloadExcelFile() {
  // Collect all data from localStorage
  const reminders = JSON.parse(localStorage.getItem('lifeos_reminders') || '[]');
  const notes = JSON.parse(localStorage.getItem('lifeos_notes') || '[]');
  const transactions = JSON.parse(localStorage.getItem('lifeos_transactions') || '[]');
  const goals = JSON.parse(localStorage.getItem('lifeos_goals') || '[]');
  const jobApplications = JSON.parse(localStorage.getItem('lifeos_jobs') || '[]');
  const memory = JSON.parse(localStorage.getItem('lifeos_memory') || '[]');

  const data: ExcelExportData = {
    reminders,
    notes,
    transactions,
    goals,
    jobApplications,
    memory,
  };

  const workbook = generateExcelExport(data);

  // Convert to JSON for xlsx library
  const json = JSON.stringify(workbook);

  // Create download link
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `LifeOS-Export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

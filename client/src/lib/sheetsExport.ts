// Google Sheets Export Utility
// Exports LifeOS data to Google Sheets

interface ExportData {
  reminders: Array<{
    title: string;
    description: string;
    category: string;
    priority: string;
    dueDate: string;
    completed: boolean;
  }>;
  notes: Array<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    createdAt: string;
  }>;
  transactions: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
    type: string;
  }>;
  goals: Array<{
    title: string;
    category: string;
    progress: number;
    deadline: string;
    status: string;
  }>;
  jobApplications: Array<{
    company: string;
    role: string;
    status: string;
    dateApplied: string;
    followUpDate: string;
  }>;
}

// Generate CSV from data
export function generateCSV(data: ExportData): string {
  let csv = '';

  // Reminders
  csv += 'REMINDERS\n';
  csv += 'Title,Description,Category,Priority,Due Date,Completed\n';
  data.reminders.forEach((r) => {
    csv += `"${r.title}","${r.description}","${r.category}","${r.priority}","${r.dueDate}","${r.completed}"\n`;
  });
  csv += '\n\n';

  // Notes
  csv += 'NOTES\n';
  csv += 'Title,Content,Category,Tags,Created Date\n';
  data.notes.forEach((n) => {
    csv += `"${n.title}","${n.content}","${n.category}","${n.tags.join(',')}","${n.createdAt}"\n`;
  });
  csv += '\n\n';

  // Transactions
  csv += 'FINANCE - TRANSACTIONS\n';
  csv += 'Description,Amount,Category,Date,Type\n';
  data.transactions.forEach((t) => {
    csv += `"${t.description}","${t.amount}","${t.category}","${t.date}","${t.type}"\n`;
  });
  csv += '\n\n';

  // Goals
  csv += 'GOALS\n';
  csv += 'Title,Category,Progress %,Deadline,Status\n';
  data.goals.forEach((g) => {
    csv += `"${g.title}","${g.category}","${g.progress}","${g.deadline}","${g.status}"\n`;
  });
  csv += '\n\n';

  // Job Applications
  csv += 'JOB APPLICATIONS\n';
  csv += 'Company,Role,Status,Date Applied,Follow-up Date\n';
  data.jobApplications.forEach((j) => {
    csv += `"${j.company}","${j.role}","${j.status}","${j.dateApplied}","${j.followUpDate}"\n`;
  });

  return csv;
}

// Download CSV file
export function downloadCSV(data: ExportData, filename: string = 'lifeos-export.csv'): void {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to Google Sheets (requires OAuth)
export async function exportToGoogleSheets(
  data: ExportData,
  userEmail: string
): Promise<void> {
  try {
    // This would require Google Sheets API integration
    // For now, we'll show instructions to user
    const csv = generateCSV(data);
    
    console.log('Google Sheets export initiated');
    console.log('Email:', userEmail);
    console.log('Data size:', csv.length, 'bytes');

    // In a real implementation, you would:
    // 1. Use Google OAuth to authenticate
    // 2. Create a new spreadsheet
    // 3. Import the CSV data
    // 4. Share with the user's email
    // 5. Return the spreadsheet URL

    // For now, trigger CSV download as fallback
    downloadCSV(data, `lifeos-export-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw error;
  }
}

// Collect all data from localStorage
export function collectAllData(): ExportData {
  const reminders = JSON.parse(localStorage.getItem('lifeos_reminders') || '[]');
  const notes = JSON.parse(localStorage.getItem('lifeos_notes') || '[]');
  const transactions = JSON.parse(localStorage.getItem('lifeos_transactions') || '[]');
  const goals = JSON.parse(localStorage.getItem('lifeos_goals') || '[]');
  const jobApplications = JSON.parse(localStorage.getItem('lifeos_job_applications') || '[]');

  return {
    reminders: reminders.map((r: any) => ({
      title: r.title || '',
      description: r.description || '',
      category: r.category || '',
      priority: r.priority || 'medium',
      dueDate: r.dueDate || '',
      completed: r.completed || false,
    })),
    notes: notes.map((n: any) => ({
      title: n.title || '',
      content: n.content || '',
      category: n.category || '',
      tags: n.tags || [],
      createdAt: n.createdAt || new Date().toISOString(),
    })),
    transactions: transactions.map((t: any) => ({
      description: t.description || '',
      amount: t.amount || 0,
      category: t.category || '',
      date: t.date || new Date().toISOString(),
      type: t.type || 'expense',
    })),
    goals: goals.map((g: any) => ({
      title: g.title || '',
      category: g.category || '',
      progress: g.progress || 0,
      deadline: g.deadline || '',
      status: g.status || 'active',
    })),
    jobApplications: jobApplications.map((j: any) => ({
      company: j.company || '',
      role: j.role || '',
      status: j.status || 'saved',
      dateApplied: j.dateApplied || new Date().toISOString(),
      followUpDate: j.followUpDate || '',
    })),
  };
}

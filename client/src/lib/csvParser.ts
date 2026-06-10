/**
 * CommBank NetBank CSV Parser
 * Handles CSV exports from CommBank NetBank
 * Expected format: Date, Amount, Description, Balance
 */

export interface ParsedTransaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
}

// Auto-categorization rules for CommBank transactions
const CATEGORY_RULES: Record<string, { pattern: RegExp; category: string }[]> = {
  Rent: [
    { pattern: /rent|landlord|property management/i, category: "Rent" },
  ],
  Groceries: [
    { pattern: /coles|woolworths|aldi|costco|supermarket|grocery|fresh produce/i, category: "Groceries" },
    { pattern: /farmers market|butcher|fishmonger/i, category: "Groceries" },
  ],
  Transport: [
    { pattern: /uber|lyft|taxi|opal|transport|petrol|fuel|parking|car wash|mechanic|servicing/i, category: "Transport" },
    { pattern: /train|bus|tram|metro|public transport/i, category: "Transport" },
  ],
  Food: [
    { pattern: /mcdonald|kfc|subway|domino|pizza|restaurant|cafe|coffee|lunch|dinner|breakfast/i, category: "Food" },
    { pattern: /deliveroo|uber eats|menulog|doordash|food delivery/i, category: "Food" },
  ],
  Subscriptions: [
    { pattern: /netflix|spotify|apple music|disney|hulu|adobe|microsoft|subscription|monthly|annual/i, category: "Subscriptions" },
    { pattern: /gym|fitness|yoga|membership/i, category: "Subscriptions" },
  ],
  Shopping: [
    { pattern: /amazon|ebay|jb hi-fi|target|kmart|cotton on|zara|h&m|uniqlo|shopping|retail/i, category: "Shopping" },
    { pattern: /clothing|apparel|fashion|shoes|clothes/i, category: "Shopping" },
  ],
  Entertainment: [
    { pattern: /cinema|movie|theater|concert|event|ticket|entertainment|show/i, category: "Entertainment" },
    { pattern: /game|steam|playstation|xbox|nintendo|gaming/i, category: "Entertainment" },
  ],
  Study: [
    { pattern: /university|college|course|tuition|textbook|book|education|school|training/i, category: "Study" },
  ],
  Travel: [
    { pattern: /hotel|airbnb|booking|flight|airline|airport|travel|vacation|holiday|resort/i, category: "Travel" },
  ],
  Health: [
    { pattern: /pharmacy|doctor|hospital|medical|dentist|clinic|health|medicine|prescription/i, category: "Health" },
    { pattern: /chemist|gp|pathology|surgery/i, category: "Health" },
  ],
  Bills: [
    { pattern: /electricity|water|gas|internet|phone|mobile|utility|bill|council|insurance/i, category: "Bills" },
    { pattern: /telstra|vodafone|optus|nbn|energy|power/i, category: "Bills" },
  ],
};

export function categorizeTransaction(description: string): string {
  for (const [mainCategory, rules] of Object.entries(CATEGORY_RULES)) {
    for (const rule of rules) {
      if (rule.pattern.test(description)) {
        return rule.category;
      }
    }
  }
  return "Other";
}

export function parseCommBankCSV(csvContent: string): ParsedTransaction[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const transactions: ParsedTransaction[] = [];

  // Skip header row if it exists
  let startIndex = 0;
  if (lines[0]?.toLowerCase().includes("date")) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line (handle quoted fields)
    const fields = parseCSVLine(line);
    if (fields.length < 3) continue;

    const dateStr = fields[0]?.trim();
    const amountStr = fields[1]?.trim();
    const description = fields[2]?.trim() || "Unknown";

    // Parse date (CommBank format: DD/MM/YYYY)
    if (!dateStr || !amountStr) continue;

    const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ""));
    if (isNaN(amount)) continue;

    const transaction: ParsedTransaction = {
      date: dateStr,
      amount: Math.abs(amount),
      description,
      category: categorizeTransaction(description),
      type: amount < 0 ? "expense" : "income",
    };

    transactions.push(transaction);
  }

  return transactions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.endsWith(".csv")) {
    return { valid: false, error: "File must be a CSV file" };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  return { valid: true };
}

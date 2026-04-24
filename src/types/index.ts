export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface DashboardData {
  currentMonth: MonthlySummary;
  recentTransactions: Transaction[];
  categoryBreakdown: {
    category: string;
    amount: number;
    count: number;
  }[];
  budgetStatus: Budget[];
}

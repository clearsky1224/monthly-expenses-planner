export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'savings';
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

export interface CreditCardExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface CreditCard {
  id: string;
  name: string;
  last4: string;
  creditLimit: number;
  billingDate: number;
  expenses: CreditCardExpense[];
  paid: boolean;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  createdAt: string;
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

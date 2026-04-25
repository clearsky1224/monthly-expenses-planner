import { Transaction, Category, Budget, MonthlySummary, CreditCard, CreditCardExpense, SavingsGoal } from '@/types';
import { GoogleSheetsManager } from './google-sheets';
import { emitDataChange } from './events';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expenses-planner-transactions',
  CATEGORIES: 'expenses-planner-categories',
  BUDGETS: 'expenses-planner-budgets',
  CREDIT_CARDS: 'expenses-planner-credit-cards',
  MONTHLY_BUDGETS: 'expenses-planner-monthly-budgets',
  SAVINGS_GOALS: 'expenses-planner-savings-goals',
  SYNC_ENABLED: 'expenses-planner-sync-enabled',
} as const;

export const defaultCategories: Category[] = [
  // Income categories
  { id: '1', name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
  { id: '2', name: 'Freelance', type: 'income', color: '#10b981', icon: 'laptop' },
  { id: '3', name: 'Investment', type: 'income', color: '#10b981', icon: 'trending-up' },
  { id: '4', name: 'Other Income', type: 'income', color: '#10b981', icon: 'plus-circle' },
  
  // Expense categories
  { id: '5', name: 'Housing', type: 'expense', color: '#ef4444', icon: 'home' },
  { id: '6', name: 'Food', type: 'expense', color: '#ef4444', icon: 'utensils' },
  { id: '7', name: 'Transportation', type: 'expense', color: '#ef4444', icon: 'car' },
  { id: '8', name: 'Utilities', type: 'expense', color: '#ef4444', icon: 'zap' },
  { id: '9', name: 'Healthcare', type: 'expense', color: '#ef4444', icon: 'heart' },
  { id: '10', name: 'Entertainment', type: 'expense', color: '#ef4444', icon: 'gamepad-2' },
  { id: '11', name: 'Shopping', type: 'expense', color: '#ef4444', icon: 'shopping-bag' },
  { id: '12', name: 'Education', type: 'expense', color: '#ef4444', icon: 'book' },
  { id: '13', name: 'Other Expenses', type: 'expense', color: '#ef4444', icon: 'minus-circle' },
];

export class DataManager {
  static isSyncEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.SYNC_ENABLED) === 'true';
  }

  static setSyncEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, enabled.toString());
  }

  static async getTransactions(): Promise<Transaction[]> {
    if (typeof window === 'undefined') return [];
    
    // Try to load from Google Sheets if sync is enabled
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          const sheetsTransactions = await sheetsManager.loadTransactions();
          if (sheetsTransactions.length > 0) {
            // Update local storage with sheets data
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sheetsTransactions));
            return sheetsTransactions;
          }
        }
      } catch (error) {
        console.error('Failed to load from Google Sheets:', error);
      }
    }
    
    // Fallback to local storage
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  static async saveTransactions(transactions: Transaction[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Always save to local storage first
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Also save to Google Sheets if sync is enabled
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.saveTransactions(transactions);
        }
      } catch (error) {
        console.error('Failed to save to Google Sheets:', error);
      }
    }
    emitDataChange();
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const transactions = await this.getTransactions();
    transactions.push(newTransaction);
    await this.saveTransactions(transactions);
    
    return newTransaction;
  }

  static async deleteTransaction(id: string): Promise<void> {
    const transactions = (await this.getTransactions()).filter(t => t.id !== id);
    await this.saveTransactions(transactions);
  }

  static async getCategories(): Promise<Category[]> {
    if (typeof window === 'undefined') return defaultCategories;
    
    // Try to load from Google Sheets if sync is enabled
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          const sheetsCategories = await sheetsManager.loadCategories();
          if (sheetsCategories.length > 0) {
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(sheetsCategories));
            return sheetsCategories;
          }
        }
      } catch (error) {
        console.error('Failed to load categories from Google Sheets:', error);
      }
    }
    
    // Fallback to local storage
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : defaultCategories;
  }

  static async saveCategories(categories: Category[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Always save to local storage first
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Also save to Google Sheets if sync is enabled
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.saveCategories(categories);
        }
      } catch (error) {
        console.error('Failed to save categories to Google Sheets:', error);
      }
    }
    emitDataChange();
  }

  static async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    
    const categories = await this.getCategories();
    categories.push(newCategory);
    await this.saveCategories(categories);
    
    return newCategory;
  }

  static async deleteCategory(id: string): Promise<void> {
    const categories = (await this.getCategories()).filter(cat => cat.id !== id);
    await this.saveCategories(categories);
  }

  static async getBudgets(): Promise<Budget[]> {
    if (typeof window === 'undefined') return [];
    
    // Try to load from Google Sheets if sync is enabled
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          const sheetsBudgets = await sheetsManager.loadBudgets();
          if (sheetsBudgets.length > 0) {
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(sheetsBudgets));
            return sheetsBudgets;
          }
        }
      } catch (error) {
        console.error('Failed to load budgets from Google Sheets:', error);
      }
    }
    
    // Fallback to local storage
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  }

  static async saveBudgets(budgets: Budget[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Always save to local storage first
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    
    // Also save to Google Sheets if sync is enabled
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.saveBudgets(budgets);
        }
      } catch (error) {
        console.error('Failed to save budgets to Google Sheets:', error);
      }
    }
  }

  static async addBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
    };
    
    const budgets = await this.getBudgets();
    budgets.push(newBudget);
    await this.saveBudgets(budgets);
    
    return newBudget;
  }

  static async getMonthlySummary(month: string): Promise<MonthlySummary> {
    const transactions = await this.getTransactions();
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(month)
    );

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: monthTransactions.length,
    };
  }

  static async getCategoryBreakdown(month: string, type: 'income' | 'expense') {
    const transactions = await this.getTransactions();
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(month) && t.type === type
    );

    const breakdown = monthTransactions.reduce((acc, transaction) => {
      const existing = acc.find(item => item.category === transaction.category);
      if (existing) {
        existing.amount += transaction.amount;
        existing.count += 1;
      } else {
        acc.push({
          category: transaction.category,
          amount: transaction.amount,
          count: 1,
        });
      }
      return acc;
    }, [] as { category: string; amount: number; count: number }[]);

    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  static async getBudgetStatus(month: string): Promise<Budget[]> {
    const budgets = (await this.getBudgets()).filter(b => b.month === month);
    const transactions = await this.getTransactions();
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(month) && t.type === 'expense'
    );

    return budgets.map(budget => {
      const spent = monthTransactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        spent,
      };
    });
  }

  // Sync methods
  static async syncToSheets(month?: string): Promise<void> {
    if (!this.isSyncEnabled()) return;
    
    try {
      const sheetsManager = GoogleSheetsManager.getInstance();
      if (sheetsManager.isAuthenticated()) {
        const transactions = await this.getTransactions();
        const categories = await this.getCategories();
        const budgets = await this.getBudgets();

        await Promise.all([
          sheetsManager.saveTransactions(transactions, month),
          sheetsManager.saveCategories(categories),
          sheetsManager.saveBudgets(budgets),
        ]);
      }
    } catch (error) {
      console.error('Failed to sync to Google Sheets:', error);
      throw error;
    }
  }

  static async syncFromSheets(month?: string): Promise<void> {
    if (!this.isSyncEnabled()) return;
    
    try {
      const sheetsManager = GoogleSheetsManager.getInstance();
      if (sheetsManager.isAuthenticated()) {
        const [transactions, categories, budgets] = await Promise.all([
          sheetsManager.loadTransactions(month),
          sheetsManager.loadCategories(),
          sheetsManager.loadBudgets(month),
        ]);

        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      }
    } catch (error) {
      console.error('Failed to sync from Google Sheets:', error);
      throw error;
    }
  }

  // ── Monthly Total Budget ──────────────────────────────────

  static async getMonthlyBudget(month: string): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          const map = await sheetsManager.loadMonthlyBudgets();
          // Sync back to localStorage
          localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGETS, JSON.stringify(map));
          return map[month] ?? null;
        }
      } catch (error) {
        console.error('Failed to load monthly budgets from Sheets:', error);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGETS);
    const map: Record<string, number> = data ? JSON.parse(data) : {};
    return map[month] ?? null;
  }

  static async setMonthlyBudget(month: string, amount: number): Promise<void> {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGETS);
    const map: Record<string, number> = data ? JSON.parse(data) : {};
    map[month] = amount;
    localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGETS, JSON.stringify(map));
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.saveMonthlyBudget(month, amount);
        }
      } catch (error) {
        console.error('Failed to save monthly budget to Sheets:', error);
      }
    }
    emitDataChange();
  }

  static async removeMonthlyBudget(month: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGETS);
    const map: Record<string, number> = data ? JSON.parse(data) : {};
    delete map[month];
    localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGETS, JSON.stringify(map));
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.removeMonthlyBudget(month);
        }
      } catch (error) {
        console.error('Failed to remove monthly budget from Sheets:', error);
      }
    }
    emitDataChange();
  }

  // ── Credit Cards ──────────────────────────────────────────

  static async getCreditCards(): Promise<CreditCard[]> {
    if (typeof window === 'undefined') return [];
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          const cards = await sheetsManager.loadCreditCards();
          localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
          return cards;
        }
      } catch (error) {
        console.error('Failed to load credit cards from Sheets:', error);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS);
    return data ? JSON.parse(data) : [];
  }

  static async saveCreditCards(cards: CreditCard[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.saveCreditCards(cards);
        }
      } catch (error) {
        console.error('Failed to save credit cards to Sheets:', error);
      }
    }
    emitDataChange();
  }

  static async addCreditCard(card: Omit<CreditCard, 'id' | 'createdAt' | 'expenses' | 'paid'>): Promise<CreditCard> {
    const newCard: CreditCard = {
      ...card,
      id: crypto.randomUUID(),
      expenses: [],
      paid: false,
      createdAt: new Date().toISOString(),
    };
    const cards = await this.getCreditCards();
    await this.saveCreditCards([...cards, newCard]);
    return newCard;
  }

  static async updateCreditCard(id: string, updates: Partial<CreditCard>): Promise<void> {
    const cards = await this.getCreditCards();
    await this.saveCreditCards(cards.map((c: CreditCard) => c.id === id ? { ...c, ...updates } : c));
  }

  static async deleteCreditCard(id: string): Promise<void> {
    const cards = await this.getCreditCards();
    await this.saveCreditCards(cards.filter((c: CreditCard) => c.id !== id));
  }

  static async addCreditCardExpense(cardId: string, expense: Omit<CreditCardExpense, 'id'>): Promise<void> {
    const cards = await this.getCreditCards();
    await this.saveCreditCards(cards.map((c: CreditCard) => {
      if (c.id !== cardId) return c;
      return { ...c, expenses: [...c.expenses, { ...expense, id: crypto.randomUUID() }] };
    }));
  }

  static async deleteCreditCardExpense(cardId: string, expenseId: string): Promise<void> {
    const cards = await this.getCreditCards();
    await this.saveCreditCards(cards.map((c: CreditCard) => {
      if (c.id !== cardId) return c;
      return { ...c, expenses: c.expenses.filter((e: CreditCardExpense) => e.id !== expenseId) };
    }));
  }

  static async toggleCreditCardPaid(cardId: string): Promise<void> {
    const cards = await this.getCreditCards();
    await this.saveCreditCards(cards.map((c: CreditCard) =>
      c.id === cardId ? { ...c, paid: !c.paid } : c
    ));
  }

  // ── Savings Goals ─────────────────────────────────────────

  static async getSavingsGoals(): Promise<SavingsGoal[]> {
    if (typeof window === 'undefined') return [];
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          const goals = await sheetsManager.loadSavingsGoals();
          localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
          return goals;
        }
      } catch (error) {
        console.error('Failed to load savings goals from Sheets:', error);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    return data ? JSON.parse(data) : [];
  }

  static async saveSavingsGoals(goals: SavingsGoal[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    if (this.isSyncEnabled()) {
      try {
        const sheetsManager = GoogleSheetsManager.getInstance();
        if (sheetsManager.isAuthenticated()) {
          await sheetsManager.saveSavingsGoals(goals);
        }
      } catch (error) {
        console.error('Failed to save savings goals to Sheets:', error);
      }
    }
    emitDataChange();
  }

  static async addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    const goals = await this.getSavingsGoals();
    await this.saveSavingsGoals([...goals, newGoal]);
    return newGoal;
  }

  static async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
    const goals = await this.getSavingsGoals();
    await this.saveSavingsGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  }

  static async deleteSavingsGoal(id: string): Promise<void> {
    const goals = await this.getSavingsGoals();
    await this.saveSavingsGoals(goals.filter(g => g.id !== id));
  }

  static async contributeToGoal(goalId: string, amount: number): Promise<void> {
    const goals = await this.getSavingsGoals();
    await this.saveSavingsGoals(goals.map(g =>
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    ));
  }

  static async getSavingsTransactions(): Promise<Transaction[]> {
    const all = await this.getTransactions();
    return all.filter(t => t.type === 'savings');
  }
}

'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  AlertTriangle,
} from 'lucide-react';
import { Transaction, DashboardData, MonthlySummary, Category } from '@/types';
import { DataManager } from '@/lib/data';
import TransactionForm from './TransactionForm';
import SyncControls from './SyncControls';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      const allTransactions = await DataManager.getTransactions();
      const currentMonth = await DataManager.getMonthlySummary(selectedMonth);
      const recentTransactions = allTransactions
        .filter(t => t.date.startsWith(selectedMonth))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const categoryBreakdown = await DataManager.getCategoryBreakdown(selectedMonth, 'expense');
      const budgetStatus = await DataManager.getBudgetStatus(selectedMonth);
      const categories = await DataManager.getCategories();

      setDashboardData({
        currentMonth,
        recentTransactions,
        categoryBreakdown,
        budgetStatus,
      });
      setTransactions(allTransactions);
      setCategories(categories);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleTransactionAdded = async (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
    await loadData();
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { currentMonth, recentTransactions, categoryBreakdown, budgetStatus } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Dashboard</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                ${currentMonth.totalIncome.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                ${currentMonth.totalExpenses.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className={`text-xl sm:text-2xl font-bold ${
                currentMonth.balance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                ${currentMonth.balance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Transaction Form */}
            <TransactionForm
              onTransactionAdded={handleTransactionAdded}
              categories={categories}
            />

            {/* Sync Controls */}
            <SyncControls
              selectedMonth={selectedMonth}
              onSyncComplete={loadData}
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 sm:mt-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Transactions
            </h2>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8">No transactions yet</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                      <p className="text-sm text-gray-500 truncate">{transaction.category}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-semibold text-sm sm:text-base ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryBreakdown.length > 0 && (
            <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Expense Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {categoryBreakdown.map((category, index) => {
                  const percentage = (category.amount / currentMonth.totalExpenses) * 100;
                  return (
                    <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{category.category}</h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{percentage.toFixed(1)}%</span>
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        ${category.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{category.count} transactions</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budget Alerts */}
          {budgetStatus.filter(b => b.spent > b.limit).length > 0 && (
            <div className="mt-6 sm:mt-8 bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Budget Alerts
              </h2>
              <div className="space-y-3">
                {budgetStatus
                  .filter(b => b.spent > b.limit)
                  .map((budget) => {
                    const overage = budget.spent - budget.limit;
                    const percentage = (budget.spent / budget.limit) * 100;
                    return (
                      <div key={budget.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div>
                          <p className="font-medium text-red-900">{budget.category}</p>
                          <p className="text-sm text-red-700">
                            ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-900">
                            +${overage.toFixed(2)} ({percentage.toFixed(0)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

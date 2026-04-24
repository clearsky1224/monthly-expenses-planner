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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { currentMonth, recentTransactions, categoryBreakdown, budgetStatus } = dashboardData;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Track your financial overview at a glance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 shadow-sm transition-all duration-200"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 shadow-lg shadow-emerald-500/10 border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Total Income</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">This month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                ${currentMonth.totalIncome.toFixed(2)}
              </p>
              <div className="mt-3 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
            </div>

            <div className="group relative bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 rounded-2xl p-6 shadow-lg shadow-rose-500/10 border border-rose-200/50 dark:border-rose-700/50 hover:shadow-xl hover:shadow-rose-500/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">Total Expenses</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400">This month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-rose-700 dark:text-rose-300">
                ${currentMonth.totalExpenses.toFixed(2)}
              </p>
              <div className="mt-3 h-1 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"></div>
            </div>

            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-2xl p-6 shadow-lg shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Balance</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Available</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  currentMonth.balance >= 0 
                    ? 'from-blue-400 to-indigo-600' 
                    : 'from-rose-400 to-rose-600'
                } rounded-xl flex items-center justify-center shadow-lg`}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${
                currentMonth.balance >= 0 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-rose-700 dark:text-rose-300'
              }`}>
                ${currentMonth.balance.toFixed(2)}
              </p>
              <div className={`mt-3 h-1 bg-gradient-to-r ${
                currentMonth.balance >= 0 
                  ? 'from-blue-400 to-indigo-600' 
                  : 'from-rose-400 to-rose-600'
              } rounded-full`}></div>
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
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Recent Transactions</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Latest financial activity</p>
                </div>
              </div>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">No transactions yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">Add your first transaction to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                      index === 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50' : 'bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                          : 'bg-gradient-to-br from-rose-400 to-rose-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-white" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                            {transaction.category}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        ${transaction.amount.toFixed(2)}
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
            <div className="mt-6 sm:mt-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Expense Categories</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Spending breakdown by category</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryBreakdown.map((category, index) => {
                  const percentage = (category.amount / currentMonth.totalExpenses) * 100;
                  const colors = [
                    'from-emerald-400 to-emerald-600',
                    'from-blue-400 to-blue-600', 
                    'from-purple-400 to-purple-600',
                    'from-pink-400 to-pink-600',
                    'from-amber-400 to-amber-600',
                    'from-rose-400 to-rose-600'
                  ];
                  const bgColors = [
                    'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
                    'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
                    'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
                    'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
                    'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
                    'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20'
                  ];
                  const colorIndex = index % colors.length;
                  return (
                    <div key={index} className={`group p-4 bg-gradient-to-br ${bgColors[colorIndex]} rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{category.category}</h3>
                        <div className={`w-8 h-8 bg-gradient-to-br ${colors[colorIndex]} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                          <span className="text-white text-xs font-bold">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                        ${category.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span>{category.count} transactions</span>
                        <span>•</span>
                        <span>{percentage.toFixed(1)}% of total</span>
                      </div>
                      <div className={`mt-3 h-1 bg-gradient-to-r ${colors[colorIndex]} rounded-full`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budget Alerts */}
          {budgetStatus.filter(b => b.spent > b.limit).length > 0 && (
            <div className="mt-6 sm:mt-8 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 backdrop-blur-xl rounded-2xl shadow-lg border border-rose-200/50 dark:border-rose-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-rose-800 dark:text-rose-200">Budget Alerts</h2>
                  <p className="text-xs text-rose-600 dark:text-rose-400">Categories exceeding budget limits</p>
                </div>
              </div>
              <div className="space-y-4">
                {budgetStatus.filter(b => b.spent > b.limit).map((budget, index) => {
                  const overage = budget.spent - budget.limit;
                  const percentage = (overage / budget.limit) * 100;
                  const severity = percentage > 50 ? 'critical' : percentage > 25 ? 'warning' : 'mild';
                  const severityColors = {
                    critical: 'from-red-500 to-red-700',
                    warning: 'from-amber-500 to-orange-600', 
                    mild: 'from-rose-400 to-rose-600'
                  };
                  const severityBgColors = {
                    critical: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
                    warning: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20',
                    mild: 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20'
                  };
                  return (
                    <div key={index} className={`group p-4 bg-gradient-to-br ${severityBgColors[severity]} rounded-2xl border border-rose-200/50 dark:border-rose-700/50 hover:shadow-lg transition-all duration-300`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{budget.category}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Budget exceeded</p>
                        </div>
                        <div className={`w-auto px-3 py-1.5 bg-gradient-to-r ${severityColors[severity]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">
                            +${overage.toFixed(2)} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Spent:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">${budget.spent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Budget:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">${budget.limit.toFixed(2)}</span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${severityColors[severity]} transition-all duration-500`}
                              style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-500 dark:text-slate-400">
                              {((budget.spent / budget.limit) * 100).toFixed(0)}% used
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {percentage.toFixed(0)}% over
                            </span>
                          </div>
                        </div>
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

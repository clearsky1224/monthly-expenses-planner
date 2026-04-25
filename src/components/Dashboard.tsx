'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Home,
  User,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Activity,
  CreditCard,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { Transaction, DashboardData, MonthlySummary, Category } from '@/types';
import { DataManager } from '@/lib/data';
import TransactionForm from './TransactionForm';
import SyncControls from './SyncControls';
import CreditCards from './CreditCards';

type TabType = 'overview' | 'add' | 'auth' | 'recent' | 'cards';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      const budget = await DataManager.getMonthlyBudget(selectedMonth);
      setMonthlyBudget(budget);
      const allTransactions = await DataManager.getTransactions();
      const currentMonth = await DataManager.getMonthlySummary(selectedMonth);
      const recentTransactions = allTransactions
        .filter(t => t.date.startsWith(selectedMonth))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

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

  const handleTransactionAdded = () => {
    loadData();
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Home },
    { id: 'add' as TabType, label: 'Add', icon: Plus },
    { id: 'cards' as TabType, label: 'Cards', icon: CreditCard },
    { id: 'recent' as TabType, label: 'Recent', icon: Clock },
    { id: 'auth' as TabType, label: 'Sync', icon: User },
  ];

  const renderOverviewTab = () => {
    if (!dashboardData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    const { currentMonth, categoryBreakdown, budgetStatus } = dashboardData;
    const savingsRate = currentMonth.totalIncome > 0 
      ? ((currentMonth.totalIncome - currentMonth.totalExpenses) / currentMonth.totalIncome) * 100 
      : 0;

    return (
      <div className="space-y-4">
        {/* Month Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Monthly Overview</h3>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpRight className="w-5 h-5 text-white" />
              <span className="text-xs text-white opacity-90">Income</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${currentMonth.totalIncome.toFixed(0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownRight className="w-5 h-5 text-white" />
              <span className="text-xs text-white opacity-90">Expenses</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${currentMonth.totalExpenses.toFixed(0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-white" />
              <span className="text-xs text-white opacity-90">Balance</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${(currentMonth.totalIncome - currentMonth.totalExpenses).toFixed(0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-white" />
              <span className="text-xs text-white opacity-90">Savings</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Monthly Total Budget */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Monthly Budget</h4>
            {!editingBudget && (
              <button
                onClick={() => { setBudgetInput(monthlyBudget?.toString() ?? ''); setEditingBudget(true); }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <Pencil className="w-3 h-3" />
                {monthlyBudget ? 'Edit' : 'Set budget'}
              </button>
            )}
          </div>

          {editingBudget ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                placeholder="e.g. 50000"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={async () => {
                  const val = parseFloat(budgetInput);
                  if (!isNaN(val) && val > 0) {
                    await DataManager.setMonthlyBudget(selectedMonth, val);
                    setMonthlyBudget(val);
                  } else if (budgetInput === '' && monthlyBudget) {
                    await DataManager.removeMonthlyBudget(selectedMonth);
                    setMonthlyBudget(null);
                  }
                  setEditingBudget(false);
                }}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingBudget(false)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : monthlyBudget ? (() => {
            const spent = currentMonth.totalExpenses;
            const pct = Math.min((spent / monthlyBudget) * 100, 100);
            const remaining = monthlyBudget - spent;
            const isOver = spent > monthlyBudget;
            const isNear = pct >= 80 && !isOver;
            return (
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className="text-sm text-gray-500 ml-1">/ ${monthlyBudget.toLocaleString()} budget</span>
                  </div>
                  <span className={`text-sm font-semibold ${ isOver ? 'text-red-600' : isNear ? 'text-orange-500' : 'text-green-600' }`}>
                    {isOver ? `$${(spent - monthlyBudget).toLocaleString(undefined, { maximumFractionDigits: 0 })} over` : `$${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} left`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${ isOver ? 'bg-red-500' : isNear ? 'bg-orange-400' : 'bg-blue-500' }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{pct.toFixed(0)}% of monthly budget used</p>
              </div>
            );
          })() : (
            <p className="text-sm text-gray-400 text-center py-2">No budget set for this month</p>
          )}
        </div>

        {/* Budget Status */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Budget Status</h4>
          <div className="space-y-3">
            {budgetStatus.map((budget) => {
              const percentage = budget.spent / budget.limit * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage > 80 && percentage <= 100;

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{budget.category}</span>
                    <span className={`font-medium ${
                      isOverBudget ? 'text-red-700' : isNearLimit ? 'text-yellow-700' : 'text-gray-700'
                    }`}>
                      ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Top Spending Categories</h4>
          <div className="space-y-2">
            {categoryBreakdown.slice(0, 5).map((category) => {
              const categoryInfo = categories.find(c => c.id === category.category);
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryInfo?.color || '#6b7280' }}
                    ></div>
                    <span className="text-sm text-gray-800">{categoryInfo?.name || category.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${category.amount.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAddTab = () => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Add Transaction</h3>
          <TransactionForm 
            onTransactionAdded={handleTransactionAdded}
            categories={categories}
            onCategoryAdded={loadData}
          />
        </div>
      </div>
    );
  };

  const renderAuthTab = () => {
    return (
      <div className="space-y-4">
        <SyncControls 
          selectedMonth={selectedMonth}
          onSyncComplete={loadData}
        />
      </div>
    );
  };

  const renderRecentTab = () => {
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-800">No transactions yet</p>
              <p className="text-sm text-gray-600">Add your first transaction to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category?.color + '20' }}
                      >
                        <span style={{ color: category?.color }}>
                          {transaction.type === 'income' ? '↓' : '↑'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-600">{category?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(transaction.date), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'add':
        return renderAddTab();
      case 'auth':
        return renderAuthTab();
      case 'recent':
        return renderRecentTab();
      case 'cards':
        return (
          <div className="space-y-4">
            <CreditCards />
          </div>
        );
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Monthly Expenses</h1>
              <p className="text-sm text-gray-600">Track your finances</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {renderContent()}
      </div>
    </div>
  );
}

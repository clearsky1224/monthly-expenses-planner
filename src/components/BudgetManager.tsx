'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Target, AlertTriangle, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Budget, Category } from '@/types';
import { DataManager } from '@/lib/data';

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      const [budgetStatus, allCategories] = await Promise.all([
        DataManager.getBudgetStatus(selectedMonth),
        DataManager.getCategories()
      ]);
      setBudgets(budgetStatus);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.limit) return;

    if (editingBudget) {
      // Update existing budget
      const updatedBudgets = budgets.map(b =>
        b.id === editingBudget.id
          ? { ...b, limit: parseFloat(formData.limit) }
          : b
      );
      await DataManager.saveBudgets(updatedBudgets);
      setEditingBudget(null);
    } else {
      // Add new budget
      await DataManager.addBudget({
        category: formData.category,
        limit: parseFloat(formData.limit),
        spent: 0,
        month: selectedMonth,
      });
    }

    setFormData({ category: '', limit: '' });
    setIsFormOpen(false);
    loadData();
  };

  const deleteBudget = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      const updatedBudgets = budgets.filter(b => b.id !== id);
      await DataManager.saveBudgets(updatedBudgets);
      loadData();
    }
  };

  const editBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
    });
    setIsFormOpen(true);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const categoriesWithBudget = budgets.map(b => b.category);
  const availableCategories = expenseCategories.filter(
    cat => !categoriesWithBudget.includes(cat.name) || editingBudget?.category === cat.name
  );

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudgetLimit - totalSpent;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Manager</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Budget
            </button>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              ${totalBudgetLimit.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              ${totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Remaining</h3>
              <div className={`w-4 h-4 rounded-full ${
                remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            <p className={`text-2xl font-bold ${
              remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${remainingBudget.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Budget Form */}
        {isFormOpen && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingBudget ? 'Edit Budget' : 'Add New Budget'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingBudget ? 'Update Budget' : 'Add Budget'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingBudget(null);
                    setFormData({ category: '', limit: '' });
                  }}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budget List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {budgets.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No budgets set for this month</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-6">
                {budgets.map((budget) => {
                  const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                  const isOverBudget = budget.spent > budget.limit;
                  const isNearLimit = percentage >= 80 && percentage < 100;

                  return (
                    <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {budget.category}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOverBudget && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Over Budget
                            </span>
                          )}
                          {isNearLimit && !isOverBudget && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Near Limit
                            </span>
                          )}
                          <div className="flex gap-1">
                            <button
                              onClick={() => editBudget(budget)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBudget(budget.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverBudget
                                ? 'bg-red-500'
                                : isNearLimit
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{percentage.toFixed(1)}% used</span>
                        <span className={`font-medium ${
                          isOverBudget
                            ? 'text-red-600'
                            : isNearLimit
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          ${Math.max(budget.limit - budget.spent, 0).toFixed(2)} remaining
                        </span>
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

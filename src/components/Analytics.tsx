'use client';

import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { DataManager } from '@/lib/data';

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const months = [];
      const monthlyData = [];
      
      for (let i = parseInt(selectedPeriod) - 1; i >= 0; i--) {
        const month = format(subMonths(new Date(), i), 'yyyy-MM');
        months.push(month);
        
        const summary = await DataManager.getMonthlySummary(month);
        monthlyData.push({
          month: format(new Date(month + '-01'), 'MMM yyyy'),
          income: summary.totalIncome,
          expenses: summary.totalExpenses,
          balance: summary.balance,
        });
      }

      // Category breakdown for current month
      const currentMonth = format(new Date(), 'yyyy-MM');
      const [expenseCategories, incomeCategories] = await Promise.all([
        DataManager.getCategoryBreakdown(currentMonth, 'expense'),
        DataManager.getCategoryBreakdown(currentMonth, 'income')
      ]);

      // Calculate trends
      const currentMonthData = monthlyData[monthlyData.length - 1];
      const previousMonthData = monthlyData[monthlyData.length - 2];
      
      const incomeTrend = previousMonthData 
        ? ((currentMonthData.income - previousMonthData.income) / previousMonthData.income) * 100
        : 0;
      
      const expenseTrend = previousMonthData
        ? ((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100
        : 0;

      setData({
        monthlyData,
        expenseCategories,
        incomeCategories,
        incomeTrend,
        expenseTrend,
        currentMonth: currentMonthData,
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { monthlyData, expenseCategories, incomeCategories, incomeTrend, expenseTrend, currentMonth } = data;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="3">Last 3 months</option>
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Month Income */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Income</h3>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${currentMonth.income.toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${
              incomeTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {incomeTrend >= 0 ? '+' : ''}{incomeTrend.toFixed(1)}% from last month
            </p>
          </div>

          {/* Current Month Expenses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Expenses</h3>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              ${currentMonth.expenses.toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${
              expenseTrend >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {expenseTrend >= 0 ? '+' : ''}{expenseTrend.toFixed(1)}% from last month
            </p>
          </div>

          {/* Current Month Balance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Balance</h3>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${
              currentMonth.balance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              ${currentMonth.balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Net for this month</p>
          </div>

          {/* Savings Rate */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Savings Rate</h3>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {currentMonth.income > 0 
                ? ((currentMonth.balance / currentMonth.income) * 100).toFixed(1)
                : '0.0'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Of income saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) => `${props.category} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  >
                    {expenseCategories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {expenseCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Transactions</th>
                    <th className="text-right py-2">Average</th>
                    <th className="text-right py-2">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseCategories.map((category: any, index: number) => {
                    const percentage = (category.amount / currentMonth.expenses) * 100;
                    const average = category.amount / category.count;
                    
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{category.category}</td>
                        <td className="text-right py-2">${category.amount.toFixed(2)}</td>
                        <td className="text-right py-2">{category.count}</td>
                        <td className="text-right py-2">${average.toFixed(2)}</td>
                        <td className="text-right py-2">{percentage.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Income Sources */}
        {incomeCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Income Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map((source: any, index: number) => {
                const percentage = (source.amount / currentMonth.income) * 100;
                
                return (
                  <div key={index} className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900">{source.category}</h3>
                    <p className="text-lg font-semibold text-green-600">
                      ${source.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-700">
                      {source.count} transactions • {percentage.toFixed(1)}% of income
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

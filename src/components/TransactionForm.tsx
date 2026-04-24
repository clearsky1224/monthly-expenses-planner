'use client';

import { useState } from 'react';
import { Plus, DollarSign, Calendar, FileText } from 'lucide-react';
import { Transaction, Category } from '@/types';
import { DataManager } from '@/lib/data';

interface TransactionFormProps {
  onTransactionAdded: (transaction: Transaction) => void;
  categories: Category[];
}

export default function TransactionForm({ onTransactionAdded, categories }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category || !date) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type,
        amount: parseFloat(amount),
        description,
        category,
        date,
        createdAt: new Date().toISOString(),
      };

      await DataManager.addTransaction(newTransaction);
      onTransactionAdded(newTransaction);

      // Reset form
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Transaction</h2>
          <p className="text-xs text-gray-600">Record your income or expense</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              type === 'expense'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              type === 'income'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount and Description Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-white" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium shadow-sm transition-all duration-200"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium shadow-sm transition-all duration-200"
                placeholder="Enter description"
                required
              />
            </div>
          </div>
        </div>

        {/* Category and Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 w-full bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                required
              >
                <option value="">Select category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="w-5 h-5 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-3 w-full bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium shadow-sm transition-all duration-200"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 sm:py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 font-medium active:scale-[0.98] shadow-sm ${
            isSubmitting ? '!bg-gray-400 !text-gray-100 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}

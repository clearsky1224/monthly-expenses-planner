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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
            Type
          </label>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 sm:py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                type === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-3 sm:py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                type === 'income'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Amount and Description Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
            placeholder="Enter description"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 sm:py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 font-medium active:scale-[0.98] shadow-sm ${
            isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, DollarSign, Calendar, FileText, Tag, X, Check, ChevronDown } from 'lucide-react';
import { Transaction, Category } from '@/types';
import { DataManager } from '@/lib/data';

interface TransactionFormProps {
  onTransactionAdded: (transaction: Transaction) => void;
  categories: Category[];
  onCategoryAdded?: (category: Category) => void;
}

const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function TransactionForm({ onTransactionAdded, categories, onCategoryAdded }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categorySearch, setCategorySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [newCategoryColor, setNewCategoryColor] = useState('#ef4444');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const filteredCategories = categories
    .filter(cat => cat.type === type)
    .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()));

  const exactMatch = categories.some(
    cat => cat.type === type && cat.name.toLowerCase() === categorySearch.toLowerCase()
  );
  const canAddNew = categorySearch.trim().length > 0 && !exactMatch;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowColorPicker(false);
        // If nothing selected, clear search
        if (!category) setCategorySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [category]);

  const handleSelectCategory = (name: string) => {
    setCategory(name);
    setCategorySearch(name);
    setShowDropdown(false);
    setShowColorPicker(false);
  };

  const handleSaveNewCategory = async () => {
    if (!categorySearch.trim()) return;
    setIsSavingCategory(true);
    try {
      const newCat: Category = {
        id: Date.now().toString(),
        name: categorySearch.trim(),
        type,
        color: newCategoryColor,
      };
      const allCategories = await DataManager.getCategories();
      await DataManager.saveCategories([...allCategories, newCat]);
      if (onCategoryAdded) onCategoryAdded(newCat);
      handleSelectCategory(newCat.name);
      setNewCategoryColor('#ef4444');
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category || !date) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newTransaction = await DataManager.addTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category,
        date,
      });

      onTransactionAdded(newTransaction);

      // Reset form
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('');
      setCategorySearch('');
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
          {/* Category - Searchable Combobox */}
          <div ref={categoryRef}>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Category
            </label>
            <div className="relative">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setCategory('');
                    setShowDropdown(true);
                    setShowColorPicker(false);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search or type a category..."
                  className="px-4 py-3 w-full bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium shadow-sm transition-all duration-200 pr-10"
                  required
                  autoComplete="off"
                />
                {category ? (
                  <button
                    type="button"
                    onClick={() => { setCategory(''); setCategorySearch(''); setShowDropdown(true); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredCategories.length > 0 && (
                    <ul>
                      {filteredCategories.map(cat => (
                        <li key={cat.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectCategory(cat.name)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-gray-900 text-sm font-medium">{cat.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add new option */}
                  {canAddNew && (
                    <div className="border-t border-gray-100">
                      {!showColorPicker ? (
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(true)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors text-blue-600"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add "{categorySearch.trim()}"</span>
                        </button>
                      ) : (
                        <div className="p-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Pick a color for "{categorySearch.trim()}"
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {CATEGORY_COLORS.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewCategoryColor(color)}
                                className={`w-6 h-6 rounded-full transition-transform ${
                                  newCategoryColor === color ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : ''
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveNewCategory}
                              disabled={isSavingCategory}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              {isSavingCategory ? 'Saving...' : 'Save category'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowColorPicker(false)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                            >
                              <X className="w-3 h-3" /> Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {filteredCategories.length === 0 && !canAddNew && (
                    <p className="px-4 py-3 text-sm text-gray-500">No categories found</p>
                  )}
                </div>
              )}
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

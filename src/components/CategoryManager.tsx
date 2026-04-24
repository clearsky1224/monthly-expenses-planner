'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, DollarSign, X, Check } from 'lucide-react';
import { Category } from '@/types';
import { DataManager } from '@/lib/data';

interface CategoryFormProps {
  category?: Category;
  onSave: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'expense' as 'income' | 'expense',
    color: category?.color || '#ef4444',
    icon: category?.icon || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave(formData);
  };

  const colorOptions = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  const iconOptions = [
    'home', 'car', 'utensils', 'shopping-bag', 'heart', 'gamepad-2',
    'book', 'briefcase', 'laptop', 'trending-up', 'plus-circle', 'minus-circle',
    'calendar', 'clock', 'zap', 'coffee', 'film', 'music', 'camera',
    'phone', 'mail', 'map', 'compass', 'settings', 'help-circle'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="w-5 h-5" />
          {category ? 'Edit Category' : 'Add Category'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter category name"
            required
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="grid grid-cols-9 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  formData.color === color
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon (Optional)
          </label>
          <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`p-2 rounded-lg transition-colors ${
                  formData.icon === icon
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={icon}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {formData.icon === icon && <Check className="w-3 h-3" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="font-medium">{formData.name || 'Category Name'}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              formData.type === 'income' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {formData.type}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {category ? 'Update' : 'Add'} Category
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const allCategories = await DataManager.getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaveCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategories = categories.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, ...categoryData }
            : cat
        );
        await DataManager.saveCategories(updatedCategories);
      } else {
        // Add new category
        await DataManager.addCategory(categoryData);
      }
      
      await loadCategories();
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      try {
        const updatedCategories = categories.filter(cat => cat.id !== category.id);
        await DataManager.saveCategories(updatedCategories);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const filteredCategories = categories.filter(cat => 
    filter === 'all' || cat.type === filter
  );

  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

  if (isFormOpen) {
    return (
      <CategoryForm
        category={editingCategory || undefined}
        onSave={handleSaveCategory}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
          <p className="text-gray-600">Create and manage custom income and expense categories</p>
        </div>

        {/* Filter and Add Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('income')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilter('expense')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expenses
              </button>
            </div>
            
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Income Categories */}
        {incomeCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
              <DollarSign className="w-5 h-5" />
              Income Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.icon && (
                        <p className="text-xs text-gray-500">{category.icon}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Categories */}
        {expenseCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
              <Tag className="w-5 h-5" />
              Expense Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.icon && (
                        <p className="text-xs text-gray-500">{category.icon}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Get started by creating your first category'
                : `No ${filter} categories found`
              }
            </p>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard as CreditCardIcon,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { CreditCard, CreditCardExpense } from '@/types';
import { DataManager } from '@/lib/data';
import { DATA_CHANGE_EVENT } from '@/lib/events';

const CARD_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-slate-600 to-slate-800',
];

export default function CreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addingExpenseFor, setAddingExpenseFor] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Add card form state
  const [cardName, setCardName] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardBillingDate, setCardBillingDate] = useState('1');
  const [cardColorIdx, setCardColorIdx] = useState(0);

  // Add expense form state
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState('');

  const refresh = useCallback(async () => {
    const [cards, cats] = await Promise.all([
      DataManager.getCreditCards(),
      DataManager.getCategories(),
    ]);
    setCards(cards);
    setCategories(cats.filter(c => c.type === 'expense').map(c => c.name));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, [refresh]);

  const handleAddCard = async () => {
    if (!cardName.trim() || !cardLimit || !cardLast4.trim()) return;
    await DataManager.addCreditCard({
      name: cardName.trim(),
      last4: cardLast4.trim().slice(-4),
      creditLimit: parseFloat(cardLimit),
      billingDate: parseInt(cardBillingDate),
    });
    setCardName(''); setCardLast4(''); setCardLimit(''); setCardBillingDate('1'); setCardColorIdx(0);
    setShowAddCard(false);
    await refresh();
  };

  const handleAddExpense = async (cardId: string) => {
    if (!expDesc.trim() || !expAmount) return;
    await DataManager.addCreditCardExpense(cardId, {
      description: expDesc.trim(),
      amount: parseFloat(expAmount),
      date: expDate,
      category: expCategory || 'Uncategorized',
    });
    setExpDesc(''); setExpAmount(''); setExpDate(new Date().toISOString().split('T')[0]); setExpCategory('');
    setAddingExpenseFor(null);
    await refresh();
  };

  const totalUsed = (card: CreditCard) => card.expenses.reduce((s, e) => s + e.amount, 0);
  const usagePercent = (card: CreditCard) => Math.min((totalUsed(card) / card.creditLimit) * 100, 100);

  const usageColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-orange-400';
    return 'bg-emerald-500';
  };

  const billingDaySuffix = (d: number) => {
    if (d >= 11 && d <= 13) return `${d}th`;
    const s = ['th', 'st', 'nd', 'rd'];
    return `${d}${s[d % 10] ?? 'th'}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-gray-900">Credit Cards</h2>
        </div>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      {/* Add Card Form */}
      {showAddCard && (
        <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">New Credit Card</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card Name</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="e.g. BDO Visa"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last 4 digits</label>
              <input
                type="text"
                value={cardLast4}
                onChange={e => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                maxLength={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Credit Limit</label>
              <input
                type="number"
                value={cardLimit}
                onChange={e => setCardLimit(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Billing Date (day)</label>
              <input
                type="number"
                value={cardBillingDate}
                onChange={e => setCardBillingDate(e.target.value)}
                min="1" max="31"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Card Color</label>
            <div className="flex gap-2">
              {CARD_COLORS.map((color, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCardColorIdx(i)}
                  className={`w-8 h-5 rounded bg-gradient-to-r ${color} ${cardColorIdx === i ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : ''} transition-transform`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddCard}
              disabled={!cardName.trim() || !cardLimit || !cardLast4.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" /> Save Card
            </button>
            <button
              onClick={() => setShowAddCard(false)}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && !showAddCard && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CreditCardIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No credit cards added yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Card" to track your credit cards</p>
        </div>
      )}

      {/* Card List */}
      {cards.map((card, idx) => {
        const used = totalUsed(card);
        const pct = usagePercent(card);
        const isExpanded = expandedCard === card.id;
        const colorClass = CARD_COLORS[idx % CARD_COLORS.length];
        const daysUntilBilling = (() => {
          const today = new Date();
          let billing = new Date(today.getFullYear(), today.getMonth(), card.billingDate);
          if (billing <= today) billing = new Date(today.getFullYear(), today.getMonth() + 1, card.billingDate);
          return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        })();

        return (
          <div key={card.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card Visual */}
            <div className={`bg-gradient-to-r ${colorClass} p-4 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs opacity-80">Credit Card</p>
                  <p className="text-base font-bold">{card.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => { await DataManager.toggleCreditCardPaid(card.id); await refresh(); }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      card.paid
                        ? 'bg-white/30 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {card.paid
                      ? <><CheckCircle className="w-3.5 h-3.5" /> Paid</>
                      : <><Circle className="w-3.5 h-3.5" /> Unpaid</>
                    }
                  </button>
                  <button
                    onClick={async () => { await DataManager.deleteCreditCard(card.id); await refresh(); }}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm tracking-widest opacity-90">•••• •••• •••• {card.last4}</p>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <p className="text-xs opacity-70">Billing date</p>
                  <p className="text-sm font-medium">{billingDaySuffix(card.billingDate)} of month</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">Available</p>
                  <p className="text-sm font-bold">₱{(card.creditLimit - used).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Usage Bar */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-600">
                  Used <span className="font-semibold text-gray-800">₱{used.toLocaleString()}</span> of ₱{card.creditLimit.toLocaleString()}
                </span>
                <span className={`text-xs font-semibold ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-orange-500' : 'text-emerald-600'}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${usageColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {pct >= 80 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">High utilization — may affect credit score</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {daysUntilBilling === 1 ? 'Billing due tomorrow' : `Billing in ${daysUntilBilling} days`}
              </p>
            </div>

            {/* Expand / Collapse Expenses */}
            <button
              onClick={() => setExpandedCard(isExpanded ? null : card.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Expenses ({card.expenses.length})</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {/* Add Expense */}
                {addingExpenseFor === card.id ? (
                  <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={expDesc}
                        onChange={e => setExpDesc(e.target.value)}
                        placeholder="Description"
                        className="col-span-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        value={expAmount}
                        onChange={e => setExpAmount(e.target.value)}
                        placeholder="Amount"
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="date"
                        value={expDate}
                        onChange={e => setExpDate(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={expCategory}
                        onChange={e => setExpCategory(e.target.value)}
                        className="col-span-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddExpense(card.id)}
                        disabled={!expDesc.trim() || !expAmount}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> Add
                      </button>
                      <button
                        onClick={() => setAddingExpenseFor(null)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingExpenseFor(card.id)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add expense
                  </button>
                )}

                {/* Expense List */}
                {card.expenses.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No expenses recorded</p>
                ) : (
                  <div className="space-y-1">
                    {[...card.expenses].reverse().map(exp => (
                      <div key={exp.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{exp.description}</p>
                          <p className="text-xs text-gray-500">{exp.category} · {exp.date}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-semibold text-gray-900">₱{exp.amount.toFixed(2)}</span>
                          <button
                            onClick={async () => { await DataManager.deleteCreditCardExpense(card.id, exp.id); await refresh(); }}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1">
                      <span className="text-xs font-semibold text-gray-600">Total</span>
                      <span className="text-sm font-bold text-gray-900">₱{used.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

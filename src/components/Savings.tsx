'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Target, TrendingUp, PiggyBank, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SavingsGoal, Transaction } from '@/types';
import { DataManager } from '@/lib/data';
import { DATA_CHANGE_EVENT } from '@/lib/events';
import { format } from 'date-fns';

const GOAL_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316',
];

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<Transaction[]>([]);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalColor, setGoalColor] = useState(GOAL_COLORS[0]);

  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const refresh = useCallback(async () => {
    const [g, t] = await Promise.all([
      DataManager.getSavingsGoals(),
      DataManager.getSavingsTransactions(),
    ]);
    setGoals(g);
    setSavingsTransactions(t);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, [refresh]);

  const totalSaved = savingsTransactions.reduce((s, t) => s + t.amount, 0);
  const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  const handleAddGoal = async () => {
    if (!goalName.trim() || !goalTarget) return;
    await DataManager.addSavingsGoal({
      name: goalName.trim(),
      targetAmount: parseFloat(goalTarget),
      deadline: goalDeadline || undefined,
      color: goalColor,
    });
    setGoalName(''); setGoalTarget(''); setGoalDeadline(''); setGoalColor(GOAL_COLORS[0]);
    setShowAddGoal(false);
  };

  const handleContribute = async (goalId: string) => {
    const amt = parseFloat(contributeAmount);
    if (isNaN(amt) || amt <= 0) return;
    await DataManager.contributeToGoal(goalId, amt);
    await DataManager.addTransaction({
      type: 'savings',
      amount: amt,
      description: `Contribution to ${goals.find(g => g.id === goalId)?.name ?? 'goal'}`,
      category: 'Savings',
      date: new Date().toISOString().split('T')[0],
    });
    setContributeAmount('');
    setContributeGoalId(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Total Saved</p>
          <p className="text-2xl font-bold">₱{totalSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs opacity-75 mt-1">{savingsTransactions.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Goals Progress</p>
          <p className="text-2xl font-bold">₱{totalGoalSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs opacity-75 mt-1">of ₱{totalGoalTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })} target</p>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-gray-900">Savings Goals</h3>
          </div>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={goalName}
                onChange={e => setGoalName(e.target.value)}
                placeholder="Goal name (e.g. Emergency Fund)"
                className="col-span-2 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={e => setGoalTarget(e.target.value)}
                  placeholder="Target amount"
                  className="pl-7 pr-3 py-2 w-full text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <input
                type="date"
                value={goalDeadline}
                onChange={e => setGoalDeadline(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Color</p>
              <div className="flex gap-1.5 flex-wrap">
                {GOAL_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setGoalColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${goalColor === c ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddGoal} disabled={!goalName.trim() || !goalTarget}
                className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white text-xs rounded-lg hover:bg-violet-600 disabled:opacity-50">
                <Check className="w-3 h-3" /> Save Goal
              </button>
              <button onClick={() => setShowAddGoal(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )}

        {goals.length === 0 && !showAddGoal ? (
          <div className="px-4 py-8 text-center">
            <PiggyBank className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No savings goals yet</p>
            <button onClick={() => setShowAddGoal(true)}
              className="mt-2 text-xs text-violet-600 hover:text-violet-800 font-medium">
              + Create your first goal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {goals.map(goal => {
              const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const remaining = goal.targetAmount - goal.currentAmount;
              const isComplete = goal.currentAmount >= goal.targetAmount;
              const isExpanded = expandedGoal === goal.id;

              return (
                <div key={goal.id}>
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: goal.color }} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{goal.name}</p>
                          {goal.deadline && (
                            <p className="text-xs text-gray-500">Target: {format(new Date(goal.deadline), 'MMM d, yyyy')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setContributeGoalId(isExpanded && contributeGoalId === goal.id ? null : goal.id); setExpandedGoal(goal.id); }}
                          className="text-xs font-medium text-violet-600 hover:text-violet-800 px-2 py-1 rounded-lg hover:bg-violet-50"
                        >
                          + Add
                        </button>
                        <button onClick={() => DataManager.deleteSavingsGoal(goal.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 font-medium">
                          ₱{goal.currentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} saved
                        </span>
                        <span className={isComplete ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                          {isComplete ? '✓ Complete!' : `₱${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} left`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: goal.color }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{pct.toFixed(0)}%</span>
                        <span>Target: ₱{goal.targetAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contribute Form */}
                  {isExpanded && contributeGoalId === goal.id && (
                    <div className="px-4 pb-3 bg-violet-50">
                      <p className="text-xs font-semibold text-violet-700 mb-2">Add contribution</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
                          <input
                            type="number"
                            value={contributeAmount}
                            onChange={e => setContributeAmount(e.target.value)}
                            placeholder="Amount"
                            className="pl-7 pr-3 py-1.5 w-full text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500"
                            autoFocus
                          />
                        </div>
                        <button onClick={() => handleContribute(goal.id)} disabled={!contributeAmount}
                          className="px-3 py-1.5 bg-violet-500 text-white text-xs rounded-lg hover:bg-violet-600 disabled:opacity-50 font-medium">
                          Save
                        </button>
                        <button onClick={() => { setContributeGoalId(null); setContributeAmount(''); }}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings Transaction History */}
      {savingsTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-gray-900">Savings History</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[...savingsTransactions]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 20)
              .map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.description}</p>
                    <p className="text-xs text-gray-500">{t.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-violet-600">
                    +₱{t.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

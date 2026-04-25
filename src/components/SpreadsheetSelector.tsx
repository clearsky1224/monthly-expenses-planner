'use client';

import { useState, useEffect } from 'react';
import { GoogleSheetsManager } from '@/lib/google-sheets';
import { 
  FileSpreadsheet, 
  Plus, 
  FolderOpen, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';

interface Spreadsheet {
  id: string;
  name: string;
  url: string;
}

interface SpreadsheetSelectorProps {
  onSpreadsheetSelected?: (spreadsheetId: string) => void;
}

export default function SpreadsheetSelector({ onSpreadsheetSelected }: SpreadsheetSelectorProps) {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSpreadsheetName, setNewSpreadsheetName] = useState('Monthly Expenses Planner');

  const sheetsManager = GoogleSheetsManager.getInstance();

  useEffect(() => {
    loadUserSpreadsheets();
    checkCurrentSpreadsheet();
  }, []);

  const loadUserSpreadsheets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userSpreadsheets = await sheetsManager.listUserSpreadsheets();
      setSpreadsheets(userSpreadsheets);
    } catch (err) {
      console.error('Error loading spreadsheets:', err);
      setError('Failed to load your spreadsheets');
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentSpreadsheet = () => {
    const currentId = sheetsManager.getUserSpreadsheetId();
    setSelectedSpreadsheetId(currentId);
  };

  const handleSelectSpreadsheet = async (spreadsheetId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await sheetsManager.selectSpreadsheet(spreadsheetId);
      if (success) {
        setSelectedSpreadsheetId(spreadsheetId);
        setSuccess('Spreadsheet selected successfully');
        if (onSpreadsheetSelected) {
          onSpreadsheetSelected(spreadsheetId);
        }
      } else {
        setError('Failed to access this spreadsheet. Make sure you have permission to view it.');
      }
    } catch (err) {
      console.error('Error selecting spreadsheet:', err);
      setError('Failed to select spreadsheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      const spreadsheetId = await sheetsManager.createSpreadsheet(newSpreadsheetName);
      
      // Reload spreadsheets list
      await loadUserSpreadsheets();
      setSelectedSpreadsheetId(spreadsheetId);
      setSuccess('New spreadsheet created successfully');
      setShowCreateForm(false);
      setNewSpreadsheetName('Monthly Expenses Planner');
      
      if (onSpreadsheetSelected) {
        onSpreadsheetSelected(spreadsheetId);
      }
    } catch (err) {
      console.error('Error creating spreadsheet:', err);
      setError('Failed to create spreadsheet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenSpreadsheet = (url: string) => {
    window.open(url, '_blank');
  };

  const selectedSpreadsheet = spreadsheets.find(s => s.id === selectedSpreadsheetId);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Google Sheets Selection
        </h3>
        <div className="flex items-center gap-2">
          {selectedSpreadsheet && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Connected
            </div>
          )}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Sheet
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      {/* Current Selection */}
      {selectedSpreadsheet && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Current Spreadsheet:</p>
              <p className="text-lg font-semibold text-blue-800">{selectedSpreadsheet.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenSpreadsheet(selectedSpreadsheet.url)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Open in Google Sheets"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Change spreadsheet"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Spreadsheet Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Create New Spreadsheet</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newSpreadsheetName}
              onChange={(e) => setNewSpreadsheetName(e.target.value)}
              placeholder="Enter spreadsheet name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateSpreadsheet}
                disabled={isCreating || !newSpreadsheetName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Your Spreadsheets</h4>
          <button
            onClick={loadUserSpreadsheets}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading spreadsheets...</span>
          </div>
        ) : spreadsheets.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">No spreadsheets found</p>
            <p className="text-sm text-gray-500">Click "New Sheet" above to create one</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {spreadsheets.map((spreadsheet) => (
              <div
                key={spreadsheet.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSpreadsheetId === spreadsheet.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectSpreadsheet(spreadsheet.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{spreadsheet.name}</p>
                    <p className="text-sm text-gray-500 truncate">{spreadsheet.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSpreadsheetId === spreadsheet.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSpreadsheet(spreadsheet.url);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Open in Google Sheets"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

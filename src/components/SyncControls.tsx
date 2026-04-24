'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { GoogleSheetsManager } from '@/lib/google-sheets';
import { DataManager } from '@/lib/data';
import GoogleSignIn from './GoogleSignIn';

interface SyncControlsProps {
  selectedMonth?: string;
  onSyncComplete?: () => void;
}

export default function SyncControls({ selectedMonth, onSyncComplete }: SyncControlsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    checkSyncStatus();
    loadLastSyncTime();
  }, []);

  const checkAuthStatus = () => {
    const sheetsManager = GoogleSheetsManager.getInstance();
    setIsAuthenticated(sheetsManager.isAuthenticated());
  };

  const checkSyncStatus = () => {
    setIsSyncEnabled(DataManager.isSyncEnabled());
  };

  const loadLastSyncTime = () => {
    const lastSync = localStorage.getItem('expenses-planner-last-sync');
    if (lastSync) {
      setLastSyncTime(lastSync);
    }
  };

  const handleAuthChange = (authenticated: boolean, userProfile?: any) => {
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      setIsSyncEnabled(false);
      DataManager.setSyncEnabled(false);
    }
  };

  const saveLastSyncTime = () => {
    const now = new Date().toISOString();
    localStorage.setItem('expenses-planner-last-sync', now);
    setLastSyncTime(now);
  };

  const handleToggleSync = () => {
    const newStatus = !isSyncEnabled;
    DataManager.setSyncEnabled(newStatus);
    setIsSyncEnabled(newStatus);
    
    if (newStatus && !isAuthenticated) {
      setError('Please connect to Google Sheets first');
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sheetsManager = GoogleSheetsManager.getInstance();
      const success = await sheetsManager.signIn();
      
      if (success) {
        setIsAuthenticated(true);
        setSuccess('Successfully connected to Google Sheets');
      } else {
        setError('Failed to connect to Google Sheets');
      }
    } catch (err) {
      setError('Error connecting to Google Sheets');
      console.error('Connect error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      const sheetsManager = GoogleSheetsManager.getInstance();
      await sheetsManager.signOut();
      
      setIsAuthenticated(false);
      setIsSyncEnabled(false);
      DataManager.setSyncEnabled(false);
      setSuccess('Disconnected from Google Sheets');
    } catch (err) {
      setError('Error disconnecting from Google Sheets');
      console.error('Disconnect error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!isAuthenticated || !isSyncEnabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await DataManager.syncToSheets(selectedMonth);
      saveLastSyncTime();
      setSuccess(`Data synced to Google Sheets${selectedMonth ? ` for ${selectedMonth}` : ''}`);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setError('Failed to sync data to Google Sheets');
      console.error('Sync to sheets error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromSheets = async () => {
    if (!isAuthenticated || !isSyncEnabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await DataManager.syncFromSheets(selectedMonth);
      setSuccess(`Data loaded from Google Sheets${selectedMonth ? ` for ${selectedMonth}` : ''}`);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setError('Failed to load data from Google Sheets');
      console.error('Sync from sheets error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullSync = async () => {
    if (!isAuthenticated || !isSyncEnabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First sync from sheets to get latest data
      await DataManager.syncFromSheets(selectedMonth);
      
      // Then sync local changes back to sheets
      await DataManager.syncToSheets(selectedMonth);
      
      saveLastSyncTime();
      setSuccess(`Full sync completed${selectedMonth ? ` for ${selectedMonth}` : ''}`);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setError('Failed to complete full sync');
      console.error('Full sync error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sign-In Component */}
      <GoogleSignIn onAuthChange={handleAuthChange} />

      {/* Sync Controls - Only show when authenticated */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Data Sync Controls
            </h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isSyncEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isSyncEnabled ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Sync Enabled
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4" />
                  Sync Disabled
                </>
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

          <div className="space-y-4">
            {/* Sync Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Enable Automatic Sync</h3>
                <p className="text-sm text-gray-500">Automatically sync data with Google Sheets</p>
              </div>
              <button
                onClick={handleToggleSync}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSyncEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Month Selection */}
            {selectedMonth && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  Syncing for: {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </span>
              </div>
            )}

            {/* Sync Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleSyncToSheets}
                disabled={isLoading || !isSyncEnabled}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="text-sm">Upload</span>
              </button>

              <button
                onClick={handleSyncFromSheets}
                disabled={isLoading || !isSyncEnabled}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="text-sm">Download</span>
              </button>

              <button
                onClick={handleFullSync}
                disabled={isLoading || !isSyncEnabled}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="text-sm">Full Sync</span>
              </button>
            </div>

            {/* Last Sync Time */}
            {lastSyncTime && (
              <div className="text-xs text-gray-500 text-center">
                Last sync: {format(new Date(lastSyncTime), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

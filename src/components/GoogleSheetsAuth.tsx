'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleSheetsManager } from '@/lib/google-sheets';

export default function GoogleSheetsAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsInitializing(true);
      const sheetsManager = GoogleSheetsManager.getInstance();
      
      // Initialize Google APIs
      await Promise.all([
        sheetsManager.initializeGapi(),
        sheetsManager.initializeGis()
      ]);

      // Check if already authenticated
      setIsAuthenticated(sheetsManager.isAuthenticated());
    } catch (err) {
      setError('Failed to initialize Google Sheets');
      console.error('Auth initialization error:', err);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sheetsManager = GoogleSheetsManager.getInstance();
      const success = await sheetsManager.signIn();
      
      if (success) {
        setIsAuthenticated(true);
      } else {
        setError('Failed to sign in to Google');
      }
    } catch (err) {
      setError('Error signing in to Google');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      const sheetsManager = GoogleSheetsManager.getInstance();
      await sheetsManager.signOut();
      
      setIsAuthenticated(false);
    } catch (err) {
      setError('Error signing out');
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Initializing Google Sheets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Google Sheets Sync
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          isAuthenticated 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isAuthenticated ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Connected
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4" />
              Disconnected
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

      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">Connect to Google Sheets to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Sync your data across devices</li>
            <li>Backup your transactions and budgets</li>
            <li>Share data with collaborators</li>
            <li>Export data for further analysis</li>
          </ul>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Setup Required</h3>
              <p className="text-sm text-blue-700 mb-3">
                To use Google Sheets sync, you need to configure your Google Cloud project:
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Create a Google Cloud project</li>
                <li>Enable Google Sheets API</li>
                <li>Create OAuth 2.0 credentials</li>
                <li>Create a Google Sheet and copy its ID</li>
                <li>Add environment variables to your project</li>
              </ol>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Connect to Google Sheets
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Connected Successfully</h3>
              <p className="text-sm text-green-700">
                Your data will be synced with Google Sheets. You can now export and import your financial data.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4" />
                  Disconnect from Google Sheets
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

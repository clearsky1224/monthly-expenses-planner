'use client';

import { useState, useEffect } from 'react';
import { GoogleSheetsManager } from '@/lib/google-sheets';
import { 
  User, 
  Mail, 
  LogOut, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import SpreadsheetSelector from './SpreadsheetSelector';

interface GoogleSignInProps {
  onAuthChange?: (isAuthenticated: boolean, userProfile?: any) => void;
}

export default function GoogleSignIn({ onAuthChange }: GoogleSignInProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const sheetsManager = GoogleSheetsManager.getInstance();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      await sheetsManager.initializeAuth();
      
      const authenticated = sheetsManager.isAuthenticated();
      const profile = sheetsManager.getUserProfile();
      
      setIsAuthenticated(authenticated);
      setUserProfile(profile);
      
      if (onAuthChange) {
        onAuthChange(authenticated, profile);
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Google authentication';
      
      // Provide more user-friendly error messages
      if (errorMessage.includes('API Key is missing')) {
        setError('Google API Key is missing. Please check your environment configuration.');
      } else if (errorMessage.includes('Client ID is missing')) {
        setError('Google Client ID is missing. Please check your environment configuration.');
      } else if (errorMessage.includes('timed out')) {
        setError('Authentication initialization timed out. Please refresh the page and try again.');
      } else if (errorMessage.includes('Failed to load')) {
        setError('Unable to load Google services. Please check your internet connection and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add callback for authentication result
      sheetsManager.addAuthCallback((success, errorMessage) => {
        setIsLoading(false);
        if (success) {
          const profile = sheetsManager.getUserProfile();
          setIsAuthenticated(true);
          setUserProfile(profile);
          
          if (onAuthChange) {
            onAuthChange(true, profile);
          }
        } else {
          setError(errorMessage || 'Failed to sign in');
          setIsAuthenticated(false);
          setUserProfile(null);
          
          if (onAuthChange) {
            onAuthChange(false);
          }
        }
      });
      
      await sheetsManager.signIn();
    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Failed to sign in';
      
      if (err instanceof Error) {
        if (err.message.includes('popup was blocked')) {
          errorMessage = '🚫 Popup was blocked by your browser. Please allow popups for this site and try again.';
        } else if (err.message.includes('ensure popups are allowed')) {
          errorMessage = '🚫 Please allow popups for this site in your browser settings and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await sheetsManager.signOut();
      
      setIsAuthenticated(false);
      setUserProfile(null);
      setError(null);
      
      if (onAuthChange) {
        onAuthChange(false);
      }
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-gray-600">Initializing Google authentication...</span>
      </div>
    );
  }

  if (isAuthenticated && userProfile) {
    return (
      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Google Account Connected
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Authenticated
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            {userProfile.picture && (
              <img
                src={userProfile.picture}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{userProfile.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {userProfile.email}
              </p>
            </div>
          </div>

          {/* Permissions Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Permissions granted:</strong> Access to Google Sheets and Drive for data synchronization
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Disconnect Google Account
              </>
            )}
          </button>
        </div>

        {/* Spreadsheet Selector */}
        <SpreadsheetSelector onSpreadsheetSelected={(spreadsheetId) => {
          // Optional: Handle spreadsheet selection
          console.log('Spreadsheet selected:', spreadsheetId);
        }} />
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Connect to Google Sheets
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Securely connect your Google account to sync your expense data with Google Sheets
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200/50 dark:border-rose-700/50 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-rose-800 dark:text-rose-200 font-medium">{error}</span>
              <button
                onClick={initializeAuth}
                className="mt-2 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium underline"
              >
                Click here to retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700 group-hover:text-gray-900">
              Sign in with Google
            </span>
          </>
        )}
      </button>

      {/* Security Note */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-700 text-center">
          <Shield className="w-3 h-3 inline mr-1 text-gray-600" />
          Your data is secure and only used for expense tracking
        </p>
      </div>

      {/* Features List */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-800">Automatic data backup</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-800">Access from any device</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-800">Export to Excel/CSV</span>
        </div>
      </div>
    </div>
  );
}

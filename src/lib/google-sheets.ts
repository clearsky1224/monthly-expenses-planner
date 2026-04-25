import { google } from 'googleapis';
import { Transaction, Category, Budget } from '@/types';

// Google Sheets configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const DRIVE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// User-specific spreadsheet storage key
const USER_SPREADSHEET_KEY = 'user_spreadsheet_id';

// Sheet names
const TRANSACTIONS_SHEET = 'Transactions';
const CATEGORIES_SHEET = 'Categories';
const BUDGETS_SHEET = 'Budgets';

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export class GoogleSheetsManager {
  private static instance: GoogleSheetsManager;
  private tokenClient: any = null;
  private gapiInited = false;
  private gisInited = false;
  private tokenObject: TokenResponse | null = null;
  private userProfile: UserProfile | null = null;
  private authCallbacks: Array<(success: boolean, error?: string) => void> = [];
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  static getInstance(): GoogleSheetsManager {
    if (!GoogleSheetsManager.instance) {
      GoogleSheetsManager.instance = new GoogleSheetsManager();
    }
    return GoogleSheetsManager.instance;
  }

  async initializeGapi() {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check if API_KEY is available
      if (!API_KEY) {
        reject(new Error('Google API Key is missing. Please check your environment variables.'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onerror = () => {
        reject(new Error('Failed to load Google APIs script. Please check your internet connection.'));
      };
      script.onload = () => {
        try {
          window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC, DRIVE_DISCOVERY_DOC],
              });
              this.gapiInited = true;
              resolve();
            } catch (error) {
              reject(new Error(`Failed to initialize Google client: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
          });
        } catch (error) {
          reject(new Error(`Failed to load Google client: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      document.body.appendChild(script);
    });
  }

  async initializeGis() {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check if CLIENT_ID is available
      if (!CLIENT_ID) {
        reject(new Error('Google Client ID is missing. Please check your environment variables.'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services script. Please check your internet connection.'));
      };
      script.onload = () => {
        try {
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly',
            callback: (tokenResponse: TokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                this.tokenObject = tokenResponse;
              }
            },
            error_callback: (error: any) => {
              console.error('Google token client error:', error);
              if (error.type === 'popup_blocked' || error.message?.includes('popup')) {
                throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
              }
            },
            prompt: 'select_account',
            include_granted_scopes: true,
          });
          this.gisInited = true;
          resolve();
        } catch (error) {
          reject(new Error(`Failed to initialize Google Identity Services: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      document.body.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.gapiInited || !this.gisInited || !this.tokenClient) {
      throw new Error('Google APIs not initialized. Please refresh the page and try again.');
    }

    return new Promise((resolve, reject) => {
      // Store original callbacks
      const originalCallback = this.tokenClient.callback;
      const originalErrorCallback = this.tokenClient.error_callback;

      // Set temporary callbacks for this sign-in attempt
      this.tokenClient.callback = async (tokenResponse: TokenResponse) => {
        try {
          if (tokenResponse && tokenResponse.access_token) {
            this.tokenObject = tokenResponse;
            
            // Store token in localStorage with expiration time
            const tokenData = {
              ...tokenResponse,
              stored_at: Date.now()
            };
            localStorage.setItem('google_sheets_token', JSON.stringify(tokenData));
            
            // Set up automatic token refresh
            this.scheduleTokenRefresh(tokenResponse.expires_in || 3600);
            
            // Fetch user profile information
            await this.fetchUserProfile();
            
            // Notify all callbacks
            this.authCallbacks.forEach(callback => callback(true));
            this.authCallbacks = [];
            
            resolve(true);
          } else {
            const error = tokenResponse.error || 'Failed to get access token';
            this.authCallbacks.forEach(callback => callback(false, error));
            reject(new Error(error));
          }
        } catch (error) {
          reject(error);
        } finally {
          // Restore original callbacks
          this.tokenClient.callback = originalCallback;
          this.tokenClient.error_callback = originalErrorCallback;
        }
      };

      this.tokenClient.error_callback = (error: any) => {
        console.error('Google token client error:', error);
        let errorMessage = 'Authentication failed';
        
        if (error.type === 'popup_blocked' || error.message?.includes('popup')) {
          errorMessage = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
        } else if (error.message) {
          errorMessage = `Authentication failed: ${error.message}`;
        }
        
        reject(new Error(errorMessage));
        
        // Restore original callbacks
        this.tokenClient.callback = originalCallback;
        this.tokenClient.error_callback = originalErrorCallback;
      };

      // Check if we already have a valid token
      if (this.tokenObject) {
        this.validateToken().then(isValid => {
          if (isValid) {
            resolve(true);
            // Restore original callbacks
            this.tokenClient.callback = originalCallback;
            this.tokenClient.error_callback = originalErrorCallback;
          } else {
            try {
              this.tokenClient.requestAccessToken();
            } catch (error) {
              reject(new Error('Failed to request access token. Please ensure popups are allowed for this site.'));
              // Restore original callbacks
              this.tokenClient.callback = originalCallback;
              this.tokenClient.error_callback = originalErrorCallback;
            }
          }
        }).catch(reject);
      } else {
        try {
          this.tokenClient.requestAccessToken();
        } catch (error) {
          reject(new Error('Failed to request access token. Please ensure popups are allowed for this site.'));
          // Restore original callbacks
          this.tokenClient.callback = originalCallback;
          this.tokenClient.error_callback = originalErrorCallback;
        }
      }
    });
  }

  async signOut(): Promise<void> {
    try {
      // Clear token refresh timer
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }
      
      // Get access token before clearing the object
      const accessToken = this.tokenObject?.access_token;
      
      // Clear token
      this.tokenObject = null;
      this.userProfile = null;
      
      // Revoke token if possible
      if (accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
        window.google.accounts.oauth2.revoke(accessToken);
      }
      
      // Clear any stored auth state
      localStorage.removeItem('google_sheets_token');
      localStorage.removeItem('google_user_profile');
      this.clearUserSpreadsheetId();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenObject?.access_token;
  }

  getToken(): TokenResponse | null {
    return this.tokenObject;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  addAuthCallback(callback: (success: boolean, error?: string) => void): void {
    this.authCallbacks.push(callback);
  }

  private async fetchUserProfile(): Promise<void> {
    try {
      const accessToken = this.tokenObject?.access_token;
      if (!accessToken) return;
      
      // For OAuth 2.0, we need to use a different approach to get user info
      // This is a simplified version - in production, you might want to use the People API
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      if (response.ok) {
        const userData = await response.json();
        this.userProfile = {
          email: userData.email,
          name: userData.name,
          picture: userData.picture
        };
        
        // Store profile in localStorage for persistence
        localStorage.setItem('google_user_profile', JSON.stringify(this.userProfile));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  private async validateToken(): Promise<boolean> {
    try {
      const accessToken = this.tokenObject?.access_token;
      if (!accessToken) return false;
      
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async initializeAuth(): Promise<void> {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Authentication initialization timed out after 10 seconds')), 10000);
      });

      await Promise.race([
        Promise.all([
          this.initializeGapi(),
          this.initializeGis()
        ]),
        timeoutPromise
      ]);
      
      // Try to restore previous session
      const storedToken = localStorage.getItem('google_sheets_token');
      const storedProfile = localStorage.getItem('google_user_profile');
      
      if (storedToken) {
        try {
          const tokenData = JSON.parse(storedToken);
          const storedAt = tokenData.stored_at || 0;
          const expiresIn = tokenData.expires_in || 3600;
          const ageInSeconds = (Date.now() - storedAt) / 1000;
          
          // Check if token is still valid (with 5 minute buffer)
          if (ageInSeconds < (expiresIn - 300)) {
            this.tokenObject = tokenData;
            
            // Validate the token is actually still valid
            const isValid = await this.validateToken();
            if (!isValid) {
              // Token is invalid, try to refresh it silently
              await this.refreshTokenSilently();
            } else {
              // Token is valid, schedule next refresh
              const remainingTime = expiresIn - ageInSeconds;
              this.scheduleTokenRefresh(remainingTime);
            }
          } else {
            // Token expired, try to refresh it silently
            await this.refreshTokenSilently();
          }
        } catch (error) {
          localStorage.removeItem('google_sheets_token');
        }
      }
      
      if (storedProfile) {
        try {
          this.userProfile = JSON.parse(storedProfile);
        } catch (error) {
          localStorage.removeItem('google_user_profile');
        }
      }
    } catch (error) {
      console.error('Error initializing authentication:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Google authentication';
      throw new Error(errorMessage);
    }
  }

  // User-specific spreadsheet methods
  getUserSpreadsheetId(): string | null {
    return localStorage.getItem(USER_SPREADSHEET_KEY);
  }

  setUserSpreadsheetId(spreadsheetId: string): void {
    localStorage.setItem(USER_SPREADSHEET_KEY, spreadsheetId);
  }

  clearUserSpreadsheetId(): void {
    localStorage.removeItem(USER_SPREADSHEET_KEY);
  }

  async createSpreadsheet(title: string = 'Monthly Expenses Planner'): Promise<string> {
    await this.ensureAuthenticated();
    
    try {
      const response = await window.gapi.client.sheets.spreadsheets.create({
        resource: {
          properties: {
            title,
          },
          sheets: [
            {
              properties: {
                title: TRANSACTIONS_SHEET,
              },
            },
            {
              properties: {
                title: CATEGORIES_SHEET,
              },
            },
            {
              properties: {
                title: BUDGETS_SHEET,
              },
            },
          ],
        },
      });

      const spreadsheetId = response.result.spreadsheetId;
      
      // Add headers to each sheet
      await this.initializeSpreadsheetSheets(spreadsheetId);
      
      // Store the spreadsheet ID for this user
      this.setUserSpreadsheetId(spreadsheetId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw new Error('Failed to create spreadsheet');
    }
  }

  async initializeSpreadsheetSheets(spreadsheetId: string): Promise<void> {
    await this.ensureAuthenticated();
    
    try {
      // Add headers to Transactions sheet
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${TRANSACTIONS_SHEET}!A1:G1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['ID', 'Type', 'Amount', 'Description', 'Category', 'Date', 'CreatedAt']],
        },
      });

      // Add headers to Categories sheet
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${CATEGORIES_SHEET}!A1:E1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['ID', 'Name', 'Type', 'Color', 'Icon']],
        },
      });

      // Add headers to Budgets sheet
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${BUDGETS_SHEET}!A1:E1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['ID', 'Category', 'Limit', 'Spent', 'Month']],
        },
      });
    } catch (error) {
      console.error('Error initializing spreadsheet sheets:', error);
      throw error;
    }
  }

  async listUserSpreadsheets(): Promise<Array<{id: string, name: string, url: string}>> {
    await this.ensureAuthenticated();
    
    try {
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id, name, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      return response.result.files?.map((file: any) => ({
        id: file.id,
        name: file.name,
        url: file.webViewLink,
      })) || [];
    } catch (error) {
      console.error('Error listing spreadsheets:', error);
      return [];
    }
  }

  async selectSpreadsheet(spreadsheetId: string): Promise<boolean> {
    await this.ensureAuthenticated();
    
    try {
      // Test if we can access the spreadsheet
      await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      this.setUserSpreadsheetId(spreadsheetId);
      return true;
    } catch (error) {
      console.error('Error accessing spreadsheet:', error);
      return false;
    }
  }

  private getSpreadsheetId(): string {
    const spreadsheetId = this.getUserSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error('No Google Sheet selected. Please click "Create New Spreadsheet" to create a new sheet for your data, or "Select Existing Spreadsheet" to use an existing one.');
    }
    return spreadsheetId;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated()) {
      await this.signIn();
    }
  }

  private getAuthHeaders(): { Authorization: string } {
    const accessToken = this.tokenObject?.access_token;
    if (!accessToken) {
      throw new Error('Not authenticated');
    }
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async ensureSheetsExist(): Promise<void> {
    await this.ensureAuthenticated();
    
    const spreadsheetId = this.getSpreadsheetId();
    
    try {
      const sheets = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId,
      });

      const existingSheets = sheets.result.sheets?.map((sheet: any) => sheet.properties.title) || [];
      
      // Create missing sheets
      const requiredSheets = [TRANSACTIONS_SHEET, CATEGORIES_SHEET, BUDGETS_SHEET];
      for (const sheetName of requiredSheets) {
        if (!existingSheets.includes(sheetName)) {
          await window.gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
              requests: [{
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              }],
            },
          });

          // Add headers
          const headers = this.getSheetHeaders(sheetName);
          await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
              values: [headers],
            },
          });
        }
      }
    } catch (error) {
      console.error('Error ensuring sheets exist:', error);
      throw error;
    }
  }

  private getSheetHeaders(sheetName: string): string[] {
    switch (sheetName) {
      case TRANSACTIONS_SHEET:
        return ['ID', 'Type', 'Amount', 'Description', 'Category', 'Date', 'CreatedAt'];
      case CATEGORIES_SHEET:
        return ['ID', 'Name', 'Type', 'Color', 'Icon'];
      case BUDGETS_SHEET:
        return ['ID', 'Category', 'Limit', 'Spent', 'Month'];
      default:
        return [];
    }
  }

  async saveTransactions(transactions: Transaction[], month?: string): Promise<void> {
    await this.ensureAuthenticated();
    await this.ensureSheetsExist();

    const spreadsheetId = this.getSpreadsheetId();

    try {
      const filteredTransactions = month 
        ? transactions.filter(t => t.date.startsWith(month))
        : transactions;

      const values = filteredTransactions.map(t => [
        t.id,
        t.type,
        t.amount,
        t.description,
        t.category,
        t.date,
        t.createdAt,
      ]);

      // Clear existing data for the month if specified
      if (month) {
        const existingData = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${TRANSACTIONS_SHEET}!A2:G`,
        });

        const rowsToRemove = existingData.result.values?.filter((row: string[]) => 
          row[5]?.startsWith(month)
        ) || [];

        if (rowsToRemove.length > 0) {
          // This is a simplified approach - in production, you'd want to be more precise
          await window.gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `${TRANSACTIONS_SHEET}!A2:G`,
          });
        }
      }

      // Append new data
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${TRANSACTIONS_SHEET}!A2:G`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values,
        },
      });
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw error;
    }
  }

  async loadTransactions(month?: string): Promise<Transaction[]> {
    await this.ensureAuthenticated();
    await this.ensureSheetsExist();

    const spreadsheetId = this.getSpreadsheetId();

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${TRANSACTIONS_SHEET}!A2:G`,
      });

      const rows = response.result.values || [];
      const transactions: Transaction[] = rows
        .filter((row: string[]) => !month || row[5]?.startsWith(month))
        .map((row: string[]) => ({
          id: row[0] || '',
          type: (row[1] as 'income' | 'expense') || 'expense',
          amount: parseFloat(row[2]) || 0,
          description: row[3] || '',
          category: row[4] || '',
          date: row[5] || '',
          createdAt: row[6] || '',
        }));

      return transactions;
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    await this.ensureAuthenticated();
    await this.ensureSheetsExist();

    const spreadsheetId = this.getSpreadsheetId();

    try {
      const values = categories.map(c => [
        c.id,
        c.name,
        c.type,
        c.color,
        c.icon || '',
      ]);

      // Clear and replace all categories
      await window.gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${CATEGORIES_SHEET}!A2:E`,
      });

      if (values.length > 0) {
        await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${CATEGORIES_SHEET}!A2:E`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values,
          },
        });
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  async loadCategories(): Promise<Category[]> {
    await this.ensureAuthenticated();
    await this.ensureSheetsExist();

    const spreadsheetId = this.getSpreadsheetId();

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${CATEGORIES_SHEET}!A2:E`,
      });

      const rows = response.result.values || [];
      return rows.map((row: string[]) => ({
        id: row[0] || '',
        name: row[1] || '',
        type: (row[2] as 'income' | 'expense') || 'expense',
        color: row[3] || '#000000',
        icon: row[4] || undefined,
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async saveBudgets(budgets: Budget[]): Promise<void> {
    await this.ensureAuthenticated();
    await this.ensureSheetsExist();

    const spreadsheetId = this.getSpreadsheetId();

    try {
      const values = budgets.map(b => [
        b.id,
        b.category,
        b.limit,
        b.spent,
        b.month,
      ]);

      // Clear and replace all budgets
      await window.gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${BUDGETS_SHEET}!A2:E`,
      });

      if (values.length > 0) {
        await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${BUDGETS_SHEET}!A2:E`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values,
          },
        });
      }
    } catch (error) {
      console.error('Error saving budgets:', error);
      throw error;
    }
  }

  async loadBudgets(month?: string): Promise<Budget[]> {
    await this.ensureAuthenticated();
    await this.ensureSheetsExist();

    const spreadsheetId = this.getSpreadsheetId();

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${BUDGETS_SHEET}!A2:E`,
      });

      const rows = response.result.values || [];
      return rows
        .filter((row: string[]) => !month || row[4] === month)
        .map((row: string[]) => ({
          id: row[0] || '',
          category: row[1] || '',
          limit: parseFloat(row[2]) || 0,
          spent: parseFloat(row[3]) || 0,
          month: row[4] || '',
        }));
    } catch (error) {
      console.error('Error loading budgets:', error);
      return [];
    }
  }

  /**
   * Schedule automatic token refresh before expiration
   */
  private scheduleTokenRefresh(expiresInSeconds: number): void {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh token 5 minutes before expiration (or halfway through if less than 10 minutes)
    const refreshBuffer = Math.min(300, expiresInSeconds / 2);
    const refreshIn = (expiresInSeconds - refreshBuffer) * 1000;

    console.log(`Token will auto-refresh in ${Math.floor(refreshIn / 1000 / 60)} minutes`);

    this.tokenRefreshTimer = setTimeout(async () => {
      console.log('Auto-refreshing token...');
      await this.refreshTokenSilently();
    }, refreshIn);
  }

  /**
   * Silently refresh the access token without user interaction
   */
  private async refreshTokenSilently(): Promise<void> {
    try {
      if (!this.tokenClient || !this.gisInited) {
        console.log('Token client not initialized, skipping silent refresh');
        return;
      }

      // Request a new token silently (this will use the existing Google session)
      return new Promise((resolve, reject) => {
        const originalCallback = this.tokenClient.callback;

        this.tokenClient.callback = async (tokenResponse: TokenResponse) => {
          try {
            if (tokenResponse && tokenResponse.access_token) {
              this.tokenObject = tokenResponse;

              // Store new token
              const tokenData = {
                ...tokenResponse,
                stored_at: Date.now()
              };
              localStorage.setItem('google_sheets_token', JSON.stringify(tokenData));

              // Schedule next refresh
              this.scheduleTokenRefresh(tokenResponse.expires_in || 3600);

              console.log('Token refreshed successfully');
              resolve();
            } else {
              console.log('Silent refresh failed, user may need to re-authenticate');
              reject(new Error('Failed to refresh token'));
            }
          } catch (error) {
            reject(error);
          } finally {
            this.tokenClient.callback = originalCallback;
          }
        };

        // Request token with prompt: 'none' for silent refresh
        try {
          this.tokenClient.requestAccessToken({ prompt: '' });
        } catch (error) {
          console.log('Silent refresh not possible, user will need to sign in again');
          this.tokenClient.callback = originalCallback;
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error during silent token refresh:', error);
      // Don't throw - just log the error and let the user re-authenticate when needed
    }
  }
}

// Type declarations for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

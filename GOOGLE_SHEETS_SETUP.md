# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the Monthly Expenses Planner app.

## Prerequisites

- Google Account
- Google Cloud Console access
- Basic understanding of APIs and OAuth

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click on the project selector at the top of the page
4. Click "NEW PROJECT"
5. Enter a project name (e.g., "Monthly Expenses Planner")
6. Click "CREATE"

## Step 2: Enable Google Sheets API

1. In your new project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on "Google Sheets API"
4. Click "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" and click "CREATE"
3. Fill in the required fields:
   - **App name**: Monthly Expenses Planner
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "SAVE AND CONTINUE" through all steps (you can skip scopes for now)
5. Go to "APIs & Services" → "Credentials"
6. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
7. Select "Web application" as the application type
8. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
9. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
10. Click "CREATE"
11. Copy the **Client ID** - you'll need this for the `.env.local` file

## Step 4: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "API Key"
3. Copy the API key - you'll need this for the `.env.local` file
4. Click "EDIT API KEY" and add restrictions:
   - **Application restrictions**: HTTP referrers
   - Add `http://localhost:3000/*` for development
   - Add `https://yourdomain.com/*` for production

## Step 5: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "+ Blank" to create a new spreadsheet
3. Name it something like "Monthly Expenses Data"
4. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - The SPREADSHEET_ID is the long string between `/d/` and `/edit`

## Step 6: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_actual_spreadsheet_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id
NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_api_key
```

## Step 7: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Go to the Dashboard page
4. Look for the "Data Sync" section
5. Click "Connect to Google Sheets"
6. Sign in with your Google account
7. Grant the necessary permissions
8. Toggle "Enable Google Sheets Sync"
9. Try uploading some data to test the connection

## How It Works

### Data Structure

The app creates three sheets in your Google Sheet:

1. **Transactions** - Stores all income and expense transactions
   - Columns: ID, Type, Amount, Description, Category, Date, CreatedAt

2. **Categories** - Stores custom categories
   - Columns: ID, Name, Type, Color, Icon

3. **Budgets** - Stores monthly budgets
   - Columns: ID, Category, Limit, Spent, Month

### Sync Behavior

- **Automatic Sync**: When enabled, data is automatically synced to Google Sheets when you add/edit transactions
- **Manual Sync**: You can manually upload, download, or perform a full sync
- **Monthly Sync**: You can sync data for specific months
- **Conflict Resolution**: The app uses a simple last-write-wins approach

### Privacy & Security

- Your data is stored in your personal Google Sheet
- The app only requests access to Google Sheets API
- No data is stored on external servers
- You can revoke access at any time from your Google Account settings

## Troubleshooting

### Common Issues

1. **"Unable to sign in" error**
   - Make sure your OAuth consent screen is properly configured
   - Check that your redirect URIs match exactly
   - Ensure your Google Cloud project has the Sheets API enabled

2. **"API key not authorized" error**
   - Verify your API key restrictions include your domain
   - Make sure the Google Sheets API is enabled

3. **"Spreadsheet not found" error**
   - Double-check your spreadsheet ID
   - Ensure the spreadsheet is shared with your Google account
   - Make sure the spreadsheet ID is correctly copied

4. **"Permission denied" error**
   - Make sure you've granted the necessary permissions
   - Try disconnecting and reconnecting
   - Check that your Google account has access to the spreadsheet

### Debug Mode

To enable debug logging, open the browser console and look for messages from:
- Google Sheets API errors
- Authentication issues
- Data sync operations

## Production Deployment

For production deployment:

1. Update your authorized JavaScript origins and redirect URIs in Google Cloud Console
2. Add your production domain to the API key restrictions
3. Update the `.env.local` file with production values
4. Ensure your Google Sheet is properly shared if multiple users will access it

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure your Google Cloud project is properly configured
4. Make sure your Google Sheet is accessible

The app will continue to work with local storage even if Google Sheets sync is not configured.

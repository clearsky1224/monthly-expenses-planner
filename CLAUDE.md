# Monthly Expenses Planner - Project Documentation

## Project Overview
A modern, mobile-first expense tracking application built with Next.js 15, React 19, TypeScript, and TailwindCSS. Features Google Sheets integration for data synchronization and backup.

**Live URL:** https://monthly-expenses-planner.vercel.app  
**Repository:** https://github.com/clearsky1224/monthly-expenses-planner  
**Last Updated:** April 25, 2026

---

## Tech Stack

### Core Technologies
- **Framework:** Next.js 15.1.3 (App Router)
- **React:** 19.0.0
- **TypeScript:** 5.x
- **Styling:** TailwindCSS 4.0.0
- **Icons:** Lucide React
- **Date Handling:** date-fns

### APIs & Services
- **Google Sheets API** - Data synchronization
- **Google OAuth 2.0** - Authentication
- **Vercel** - Hosting and deployment

### Storage
- **Google Sheets** - PRIMARY database and source of truth (when authenticated)
- **LocalStorage** - Offline cache / fallback when not authenticated

---

## Current Status: ✅ PRODUCTION READY

### What Works Perfectly

#### 1. **Mobile App UI (Redesigned)**
- ✅ Tab-based navigation (Overview, Add, Sync, Recent)
- ✅ Modern gradient cards for financial summary
- ✅ Responsive design optimized for mobile devices
- ✅ Clean, professional appearance
- ✅ All text properly visible with good contrast

#### 2. **Dashboard Features**
- ✅ **Overview Tab:**
  - Monthly income/expense summary cards
  - Budget status with progress bars
  - Top spending categories
  - Month selector with improved styling
  - Savings rate calculation
- ✅ **Add Tab:**
  - Quick transaction form
  - Category selection
  - Date picker with custom styling
- ✅ **Sync Tab:**
  - Google authentication
  - Spreadsheet creation/selection
  - Sync controls
- ✅ **Recent Tab:**
  - Last 20 transactions
  - Category color coding
  - Transaction type indicators

#### 3. **Transaction Management**
- ✅ Add income/expense transactions
- ✅ Category-based organization
- ✅ Date tracking
- ✅ Amount and description fields
- ✅ Form validation
- ✅ Auto-save to localStorage

#### 4. **Google Sheets Integration**
- ✅ OAuth 2.0 authentication
- ✅ Create new spreadsheet functionality
- ✅ Select existing spreadsheet
- ✅ Automatic sync toggle
- ✅ Manual sync controls (upload/download)
- ✅ User-specific data isolation
- ✅ Spreadsheet ID persistence

#### 5. **Category Management**
- ✅ Dynamic categories
- ✅ Income/expense type separation
- ✅ Color coding
- ✅ Custom category creation

#### 6. **Budget Tracking**
- ✅ Category-based budgets
- ✅ Progress visualization
- ✅ Over-budget warnings
- ✅ Near-limit alerts (80%+)

---

## Issues Fixed (April 25, 2026 Session)

### UI/UX Fixes
1. ✅ **Dashboard Redesign** - Converted to mobile app UI with tabs
2. ✅ **Text Visibility Issues** - Fixed all unreadable text across components
3. ✅ **Date Picker Styling** - Improved calendar appearance and text contrast
4. ✅ **Google Login Check Items** - Fixed text visibility
5. ✅ **Data Sync Controls Title** - Fixed text contrast
6. ✅ **TransactionForm** - Removed dark mode, improved all text colors
7. ✅ **Duplicate Google Login** - Removed duplicate sign-in component
8. ✅ **Debug Environment Display** - Removed DebugEnv component from production

### Authentication Fixes
9. ✅ **Sign-in State Persistence** - Fixed authentication showing sign-in after already signed in
10. ✅ **User Profile Display** - Made conditional to prevent blocking authenticated view

### Google Sheets Sync Fixes
11. ✅ **Spreadsheet Selection UI** - Added create/select buttons
12. ✅ **Sync Error Messages** - Improved user guidance
13. ✅ **Authentication State Sync** - Fixed state synchronization between components

---

## File Structure

```
monthly-expenses-planner/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (Dashboard)
│   │   ├── globals.css         # Global styles + date picker custom CSS
│   │   └── [routes]/           # Other pages
│   ├── components/
│   │   ├── Dashboard.tsx       # ✅ Main dashboard with tabs
│   │   ├── GoogleSignIn.tsx    # ✅ Google OAuth component
│   │   ├── SyncControls.tsx    # ✅ Sync management
│   │   ├── TransactionForm.tsx # ✅ Add transaction form
│   │   ├── Layout.tsx          # App layout wrapper
│   │   └── [other components]
│   ├── lib/
│   │   ├── google-sheets.ts    # ✅ Google Sheets API manager
│   │   ├── data.ts             # ✅ Data management layer
│   │   └── utils.ts
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── .env.local                  # Environment variables
├── CLAUDE.md                   # This file
└── package.json
```

---

## Environment Variables

### Required for Google Sheets Integration

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=355022662877-3h28bj91t7h2sjgh050sthjk16v9pjc9.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyDT85HmitWztv3HNhaG1nJTWf9h44wyDuU
```

### Google Cloud Console Setup
1. Project: Monthly Expenses Planner
2. APIs Enabled:
   - Google Sheets API
   - Google Drive API (readonly)
3. OAuth 2.0 Credentials configured
4. Authorized JavaScript origins: https://monthly-expenses-planner.vercel.app

---

## Design System

### Color Palette (Light Theme Only)
- **Primary:** Blue (#3B82F6, #2563EB)
- **Success/Income:** Green (#10B981, #059669)
- **Danger/Expense:** Red (#EF4444, #DC2626)
- **Warning:** Yellow (#F59E0B, #D97706)
- **Info:** Purple (#8B5CF6, #7C3AED)

### Text Colors (Optimized for Readability)
- **Headings:** `text-gray-900` (very dark)
- **Body:** `text-gray-800` (dark)
- **Secondary:** `text-gray-600`, `text-gray-700` (medium)
- **Subtle:** `text-gray-500` (icons/hints only)
- **Never use:** `text-gray-400`, `text-gray-300` (too light)

### Typography
- **Font Family:** System fonts via Geist Sans
- **Headings:** Bold, larger sizes
- **Body:** Medium weight
- **Labels:** Bold, smaller sizes

### Components
- **Cards:** White background, rounded-xl, shadow-sm
- **Buttons:** Rounded-lg, gradient backgrounds
- **Inputs:** Rounded-xl, border-gray-300, focus:ring-blue-500
- **Tabs:** Bottom border indicator, icon + label

---

## Key Features Implementation

### 1. Mobile App Navigation
**Location:** `src/components/Dashboard.tsx`

```tsx
const tabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'auth', label: 'Sync', icon: User },
  { id: 'recent', label: 'Recent', icon: Clock },
];
```

### 2. Google Sheets Sync
**Location:** `src/lib/google-sheets.ts`

- Singleton pattern for GoogleSheetsManager
- OAuth 2.0 token management
- Spreadsheet creation/selection
- Data sync (upload/download)
- User-specific sheet storage

### 3. Data Management
**Location:** `src/lib/data.ts`

- **Google Sheets is the source of truth** — all reads/writes go to Sheets first when sync is enabled and user is authenticated
- LocalStorage is a cache/offline fallback only
- All data layers (transactions, categories, budgets, monthly budgets, credit cards) follow the same pattern:
  1. Write to localStorage immediately
  2. Write to Google Sheets if authenticated
  3. On read: fetch from Sheets first, sync to localStorage, fallback to localStorage if offline
- Transaction CRUD operations
- Category management
- Budget tracking (per-category + total monthly budget)
- Credit card tracking with expenses
- Monthly summaries

---

## Data Architecture — CRITICAL RULE

> **Google Sheets is the database. localStorage is the cache.**

Every data entity must follow this pattern in `data.ts`:
- **Reads:** Try Sheets first → cache to localStorage → fallback to localStorage if unauthenticated/offline
- **Writes:** Write to localStorage immediately → also write to Sheets if authenticated
- **Never treat localStorage as the source of truth** — it is only a cache for offline access

### Google Sheets — Sheet Inventory
| Sheet | Columns | Entity |
|---|---|---|
| `Transactions` | ID, Type, Amount, Description, Category, Date, CreatedAt | Transactions |
| `Categories` | ID, Name, Type, Color, Icon | Categories |
| `Budgets` | ID, Category, Limit, Spent, Month | Per-category budgets |
| `MonthlyBudgets` | Month, Amount | Total monthly budget |
| `CreditCards` | ID, Name, Last4, CreditLimit, BillingDate, Paid, CreatedAt | Credit cards |
| `CardExpenses` | ID, CardID, Description, Amount, Date, Category | Credit card expenses |
| `SavingsGoals` | ID, Name, TargetAmount, CurrentAmount, Deadline, Color, CreatedAt | Savings goals |

All sheets are **auto-created** by `ensureSheetsExist()` on first authenticated API call.

---

## Known Limitations

1. **No Server-Side Rendering** - User data not pre-rendered
2. **Single User** - No multi-user support (by design)
3. **Google Sheets Required for Persistence** - Without Google auth, data only lives in localStorage (browser cache)
4. **No Offline Sync Queue** - Changes made offline are not queued; Sheets and localStorage may diverge until next authenticated session

---

## Deployment

### Vercel Configuration
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Environment Variables:** Set in Vercel dashboard

### Automatic Deployment
- **Trigger:** Push to `main` branch
- **Platform:** Vercel
- **URL:** https://monthly-expenses-planner.vercel.app

---

## Development Workflow

### Local Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
git add .
git commit -m "Your message"
git push origin main
# Vercel auto-deploys
```

---

## Testing Checklist

### Before Each Deployment
- [ ] All text is readable (no light gray on white)
- [ ] Google authentication works
- [ ] Spreadsheet creation/selection works
- [ ] Transactions can be added
- [ ] Data syncs to Google Sheets
- [ ] Mobile layout is responsive
- [ ] No console errors
- [ ] No TypeScript errors

---

## Future Enhancements (Not Implemented)

- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Advanced analytics/charts
- [ ] Export to PDF
- [ ] Budget recommendations
- [ ] Receipt photo uploads
- [ ] Multi-user accounts
- [ ] Server-side data storage

---

## Troubleshooting

### Google Sheets Sync Not Working
1. Check environment variables are set
2. Verify Google Cloud Console OAuth settings
3. Ensure user has created/selected a spreadsheet
4. Check browser console for errors

### Text Not Visible
- All components now use `text-gray-800` or darker
- Avoid `text-gray-400` or lighter colors
- Check contrast ratio for accessibility

### Authentication Issues
- Clear browser cache and localStorage
- Re-authenticate with Google
- Check popup blockers are disabled

---

## Contact & Support

**Developer:** Paul Jezreel S. Bondad  
**Project Type:** Personal Finance Tracker  
**License:** Private/Personal Use

---

**Last Updated:** April 25, 2026 1:20 PM UTC+08:00

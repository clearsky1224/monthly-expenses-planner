# 🚨 Vercel Deployment Troubleshooting

## Common Issues & Solutions

### 1. Build Errors

#### **TypeScript Errors**
```
Error: TypeScript compilation failed
```
**Solution:**
- Check build logs in Vercel dashboard
- Fix TypeScript errors locally: `npm run build`
- Temporarily ignore errors: Add to `next.config.ts`:
```typescript
typescript: {
  ignoreBuildErrors: true,
},
```

#### **ESLint Errors**
```
Error: ESLint failed
```
**Solution:**
- Fix ESLint errors: `npm run lint`
- Or ignore in `next.config.ts`:
```typescript
eslint: {
  ignoreDuringBuilds: true,
},
```

### 2. Environment Variables

#### **Missing Environment Variables**
```
Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined
```
**Solution:**
1. Go to Vercel dashboard → your project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key
   ```
3. Redeploy

### 3. Google OAuth Issues

#### **Redirect URI Mismatch**
```
Error: redirect_uri_mismatch
```
**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel URL to Authorized redirect URIs:
   ```
   https://your-app-name.vercel.app
   ```
4. Save and redeploy

### 4. Import/Module Issues

#### **Module Not Found**
```
Error: Cannot find module 'googleapis'
```
**Solution:**
1. Check `package.json` has all dependencies
2. Ensure `node_modules` is in `.gitignore`
3. Redeploy: Vercel will reinstall dependencies

### 5. Runtime Errors

#### **Window is not defined**
```
Error: window is not defined
```
**Solution:**
This happens when client-side code runs on server. Add checks:
```typescript
if (typeof window !== 'undefined') {
  // Client-side code here
}
```

## Quick Fix Commands

### **Local Testing**
```bash
# Test build locally
npm run build

# Test production build locally
npm start
```

### **Force Redeploy**
```bash
# Using Vercel CLI
npx vercel --force

# Or push a small change to trigger redeploy
echo "// trigger redeploy" >> README.md
git add README.md
git commit -m "trigger redeploy"
git push
```

## Debug Steps

### 1. Check Vercel Logs
1. Go to Vercel dashboard
2. Click your project
3. Go to "Logs" tab
4. Check build and runtime logs

### 2. Check Environment Variables
1. Project → Settings → Environment Variables
2. Ensure all required variables are set
3. Check for typos in variable names

### 3. Verify Google Cloud Setup
1. Ensure APIs are enabled (Sheets API, Drive API)
2. Check OAuth consent screen is configured
3. Verify redirect URIs include your Vercel URL

### 4. Test Locally with Production Variables
```bash
# Create .env.production.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key

# Test production build
npm run build
npm start
```

## Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| `Build failed` | Check build logs, fix TypeScript/ESLint errors |
| `404: Not Found` | Check routing, ensure pages exist in `src/app/` |
| `500: Internal Error` | Check runtime logs, fix server-side errors |
| `OAuth error` | Update Google Cloud Console with Vercel URL |
| `Environment variable not found` | Add variables in Vercel dashboard |

## Get Help

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
3. **Community**: GitHub Discussions, Stack Overflow

## Pro Tips

- ✅ Always test `npm run build` locally before deploying
- ✅ Use Vercel preview deployments for testing
- ✅ Keep environment variables organized
- ✅ Monitor Vercel logs for issues
- ✅ Use GitHub integration for automatic deployments

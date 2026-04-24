# 🚀 Deployment Guide - Monthly Expenses Planner

## 📋 Prerequisites

1. **Google Cloud Console Setup**
   - Google Client ID configured
   - Google API Key created
   - OAuth consent screen completed

2. **Git Repository**
   - Code committed to Git
   - Repository created (GitHub/GitLab/Bitbucket)

## 🌐 Deploy to Vercel (Free)

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/monthly-expenses-planner.git
git push -u origin main
```

#### Step 2: Deploy via Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure settings (auto-detected for Next.js)
6. Add environment variables
7. Click "Deploy"

#### Step 3: Environment Variables
Add these in Vercel dashboard:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key
```

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npx vercel

# Follow prompts to link project
```

## 🔧 Configuration Files

### vercel.json (Included)
- Optimized for Next.js
- Environment variables configured
- Build settings optimized

### .env.local (Local Development)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key
```

## 🌍 Deployment URLs

After deployment, you'll get:
- **Production URL**: `https://your-app.vercel.app`
- **Preview URLs**: For each deployment
- **Custom Domain**: Optional (your-domain.com)

## ✅ Post-Deployment Checklist

- [ ] Test Google OAuth authentication
- [ ] Test spreadsheet selection
- [ ] Test transaction creation
- [ ] Test mobile responsiveness
- [ ] Verify environment variables
- [ ] Check error handling

## 🔒 Security Notes

- Environment variables are encrypted
- No server-side secrets exposed
- OAuth flow is secure
- Data stored in user's Google Sheets

## 📱 Mobile Optimization

Your deployed app includes:
- Responsive design for all screen sizes
- Touch-friendly interactions
- Optimized performance
- PWA capabilities

## 🔄 Automatic Deployments

With GitHub integration:
- Push to main → Production deployment
- Pull requests → Preview deployments
- Automatic builds and deployments

## 🆘 Troubleshooting

### Common Issues:
1. **OAuth redirect errors**: Update Google Cloud Console with Vercel URL
2. **Environment variables**: Ensure they're set in Vercel dashboard
3. **Build failures**: Check logs and ensure dependencies are installed

### Solutions:
- Clear Vercel cache: `npx vercel --force`
- Redeploy: Push new commit or use dashboard
- Check logs in Vercel dashboard

## 💡 Pro Tips

1. **Custom Domain**: Add your domain in Vercel dashboard for professional URL
2. **Analytics**: Enable Vercel Analytics for usage insights
3. **Performance**: Use Vercel Speed Insights for optimization
4. **Collaboration**: Invite team members to Vercel project

## 📈 Vercel Free Tier Limits

- **100GB Bandwidth** per month
- **Unlimited Static Sites**
- **Serverless Functions**: 100K invocations/month
- **Builds**: 100 per month
- **No credit card required**

Perfect for your Monthly Expenses Planner! 🎉

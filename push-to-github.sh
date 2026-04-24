#!/bin/bash

echo "🚀 Pushing Monthly Expenses Planner to GitHub"
echo "=========================================="

# Step 1: Update with your GitHub username
echo "⚠️  IMPORTANT: Replace YOUR_USERNAME with your actual GitHub username!"
echo ""
echo "Run this command first:"
echo "git remote set-url origin https://github.com/YOUR_USERNAME/monthly-expenses-planner.git"
echo ""

# Step 2: Push to GitHub
echo "Then run this command:"
echo "git push -u origin main"
echo ""

echo "✅ After pushing, go back to Vercel and import your repository!"
echo "📋 Your repository contains:"
git log --oneline --graph

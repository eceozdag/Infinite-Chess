# Deployment Guide

## Deploy to Vercel

This guide shows you how to deploy your AI Chess Battle game to Vercel for free hosting.

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI globally**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project directory**:
   ```bash
   cd /Users/eceozdag/Infinite-Chess
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the interactive prompts**:
   - First time: You'll be asked to log in or sign up
   - Confirm project settings (just press Enter to accept defaults)
   - Wait for deployment to complete

5. **Your app is now live!**
   - You'll get a URL like: `https://infinite-chess-xxxxx.vercel.app`
   - Share this URL with anyone to let them watch AI chess battles

### Method 2: Using Vercel Dashboard (No CLI Required)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login

2. **Click "Add New Project"**

3. **Import your project**:
   - Option A: Connect your GitHub/GitLab/Bitbucket repository
   - Option B: Drag and drop your project folder

4. **Configure (usually auto-detected)**:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

5. **Click "Deploy"** and wait for it to finish

6. **Your app is live!** Visit the provided URL

### Method 3: Deploy from Git Repository

If your code is in a Git repository:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Chess Battle"
   git branch -M main
   git remote add origin https://github.com/yourusername/infinite-chess.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Connect your GitHub account
   - Select your repository
   - Click "Deploy"

### Configuration Files

The project includes:
- **vercel.json**: Vercel configuration for static site deployment
- **.vercelignore**: Files to exclude from deployment

### Environment Variables (for API Keys)

**Important**: Never commit API keys to Git!

For production deployment with API keys:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `ANTHROPIC_API_KEY` (your Anthropic key)
   - `OPENAI_API_KEY` (your OpenAI key)

Note: Since this is a client-side app, users will still need to enter their own API keys in the UI. The environment variables are optional and for demo purposes only.

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Updating Your Deployment

**If using CLI**:
```bash
vercel --prod
```

**If using Git integration**:
- Just push to your main branch
- Vercel automatically rebuilds and deploys

### Troubleshooting

**Deployment fails**:
- Check the build logs in Vercel Dashboard
- Ensure all files are committed (if using Git)
- Verify vercel.json is valid JSON

**Game doesn't load**:
- Check browser console for errors
- Ensure CDN links are accessible
- Verify all files are deployed (check Vercel file browser)

**CORS errors with API calls**:
- This shouldn't happen as API calls are made from client-side
- Ensure API keys are correctly entered in the UI

### Cost

- Vercel offers a generous free tier
- Perfect for personal projects and demos
- No credit card required for free tier

### Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

For game issues:
- Check the browser console
- Review README.md for usage instructions

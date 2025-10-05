# GitHub Pages Deployment Guide

This guide will help you deploy the MH Wilds Talisman Manager to GitHub Pages.

## Prerequisites

1. A GitHub account
2. The project pushed to a GitHub repository
3. GitHub Pages enabled on your repository

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 2. Repository Settings

Make sure your repository has the following settings:
- **Repository visibility**: Public (required for free GitHub Pages)
- **Actions permissions**: Enabled
- **Pages permissions**: Enabled

### 3. Push Your Code

The GitHub Action will automatically deploy when you push to the `main` branch:

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

### 4. Monitor Deployment

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually takes 2-3 minutes)
4. Once successful, your site will be available at:
   ```
   https://[your-username].github.io/[repository-name]
   ```

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the static site
npm run build

# The static files will be in the 'out' directory
# Upload the contents of 'out' to your web hosting service
```

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in the `public` directory with your domain:
   ```
   your-domain.com
   ```

2. Update your DNS settings to point to GitHub Pages
3. In GitHub repository settings, add your custom domain in the Pages section

## Troubleshooting

### Common Issues

1. **Build fails**: Check the Actions tab for error logs
2. **Site not loading**: Verify GitHub Pages is enabled and using GitHub Actions as source
3. **404 errors**: Make sure `trailingSlash: true` is set in `next.config.js` (already configured)

### Local Testing

Test the static export locally:

```bash
# Build the static site
npm run build

# Serve the static files
npx serve out

# Open http://localhost:3000 to test
```

## Features

- ✅ **Automatic deployment** on push to main branch
- ✅ **Static site generation** for fast loading
- ✅ **No server required** - pure client-side application
- ✅ **Local storage** - data persists in browser
- ✅ **Responsive design** - works on all devices

## File Structure

After deployment, your site will have:
```
/
├── index.html          # Main page
├── _not-found.html     # 404 page
├── talisman-templates.json  # Game data
└── _next/              # Next.js assets
    ├── static/
    └── ...
```

The deployment is now ready! Your MH Wilds Talisman Manager will be available as a static website on GitHub Pages.

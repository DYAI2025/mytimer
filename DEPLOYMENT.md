# Deployment Guide

## Vercel Deployment (Recommended)

This project is optimized for deployment on Vercel.

### Prerequisites
- Git repository pushed to GitHub, GitLab, or Bitbucket
- Vercel account (free tier available at [vercel.com](https://vercel.com))

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Easiest)
1. **Push your code** to your Git provider:
   ```bash
   git add .
   git commit -m "feat: Complete UI redesign and Vercel deployment setup"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - Vercel will auto-detect the Vite framework

3. **Configure (if needed)**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a production URL like `https://your-app.vercel.app`

#### Option 2: Deploy via Vercel CLI
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Configuration Files

- **`vercel.json`**: Vercel-specific configuration
  - Configures SPA routing (all routes redirect to `/index.html`)
  - Sets cache headers for static assets
  - Defines build settings

- **`.vercelignore`**: Files to exclude from deployment
  - Reduces upload size
  - Excludes development files and build artifacts

### Environment Variables

Currently, this project doesn't require any environment variables. If you need to add them:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables for Production, Preview, and Development environments

### Custom Domain

To use a custom domain:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Configure DNS records as instructed by Vercel

### Automatic Deployments

Vercel automatically:
- **Deploys to production** on pushes to `main` branch
- **Creates preview deployments** for pull requests
- **Runs builds** with the configured build command
- **Serves the app** from the `dist` folder

### Build Optimization

The project includes several optimizations:
- **Code splitting**: React vendor chunk separated
- **Tree shaking**: Unused code removed
- **Minification**: CSS and JS minified
- **Asset optimization**: Images and fonts optimized
- **Cache headers**: Long-term caching for static assets

### Troubleshooting

#### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run type-check`

#### 404 on Routes
- Verify `vercel.json` rewrites configuration is correct
- All routes should redirect to `/index.html` for SPA routing

#### Slow Build Times
- Check bundle size: `npm run build:analyze`
- Review dependencies
- Consider code splitting strategies

### Monitoring

Vercel provides:
- **Analytics**: Page views and performance metrics
- **Logs**: Real-time function and build logs
- **Insights**: Web Vitals and performance scores

Access these in your project dashboard.

### Support

- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev
- Project Issues: Create an issue in your repository

---

## Alternative Deployment Options

### Netlify

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Configure redirects**:
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install -D gh-pages
   ```

2. **Add to package.json**:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

### Docker

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t timer-collection .
docker run -p 8080:80 timer-collection
```

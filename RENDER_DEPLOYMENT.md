# Deploying Nocturne to Render

This guide covers deploying the Nocturne application to Render.com.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your code pushed to a GitHub repository
3. A PostgreSQL database (using Neon as configured in `.env`)

## Deployment Steps

### Step 1: Create a New Web Service

1. Log in to your Render dashboard
2. Click "New +" button and select "Web Service"
3. Connect your GitHub repository
4. Select the Nocturne repository

### Step 2: Configure Build Settings

Configure your service with these settings:

| Setting | Value |
|---------|-------|
| **Name** | nocturne (or your preferred name) |
| **Region** | Choose closest to your users |
| **Branch** | main (or your default branch) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or paid for better performance) |

### Step 3: Set Environment Variables

Click on "Environment" tab and add these variables:

#### Required Variables

```bash
# Database (use your Neon database URL)
DATABASE_URL=postgresql://neondb_owner:npg_BiANFhq21kVc@ep-sparkling-art-ahmkor6n.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Session Security - GENERATE A NEW SECRET!
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your_secure_random_secret_here

# Environment
NODE_ENV=production
```

#### Optional Firebase Variables

If you want to customize Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=AIzaSyBzrabH9FEcd3zoMKsXErV0JQJQkJfeiW4
VITE_FIREBASE_AUTH_DOMAIN=nocturne-web1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nocturne-web1
VITE_FIREBASE_STORAGE_BUCKET=nocturne-web1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=491993562697
VITE_FIREBASE_APP_ID=1:491993562697:web:f1f08df364d04c2f7ec998
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Start the server

3. Monitor the deployment logs for any errors

### Step 5: Configure Firebase OAuth

After deployment, you need to update Firebase settings:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (nocturne-web1)
3. Go to Authentication → Settings → Authorized Domains
4. Add your Render domain: `your-app-name.onrender.com`

### Step 6: Verify Deployment

1. Visit your Render URL (e.g., `https://nocturne.onrender.com`)
2. Test the authentication flow:
   - Click "Sign in with Google"
   - Complete the OAuth flow
   - Verify you're redirected to the home page (not stuck on login)
   - Refresh the page to ensure session persists

## Troubleshooting

### Authentication Still Stuck?

**Check these in order:**

1. **Environment Variables Set?**
   - Go to Render Dashboard → Your Service → Environment
   - Verify `SESSION_SECRET` is set
   - Verify `NODE_ENV=production`
   - Verify `DATABASE_URL` is correct

2. **Check Logs:**
   ```bash
   # In Render Dashboard → Logs, look for:
   - "Server started on port 10000" ✓
   - "Environment: production" ✓
   - "Firebase initialized successfully" ✓
   - Any 401 errors on /api/user
   ```

3. **Firebase Authorized Domains:**
   - Ensure your Render domain is added to Firebase Console
   - Check for CORS errors in browser console (F12)

4. **Session Cookie Issues:**
   - Open Browser DevTools (F12) → Application → Cookies
   - Look for `connect.sid` cookie after login
   - If missing, check if `secure` flag is properly set

5. **Database Connection:**
   - Verify DATABASE_URL is accessible from Render
   - Check Neon dashboard for connection issues

### Common Errors

#### "Firebase popup blocked"
- Make sure Firebase authorized domains includes your Render URL

#### "401 Unauthorized on /api/user"
- Session cookie not being sent/stored
- Check `SESSION_SECRET` is set
- Verify `trust proxy` is enabled (should be automatic in production)

#### "Database connection failed"
- Check DATABASE_URL format
- Ensure SSL mode is correct for Neon
- Verify database is accessible from Render's IP range

### Performance Tips

1. **Free tier limitations:**
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading to paid tier for production use

2. **Build optimization:**
   - Builds cached between deployments
   - Use `npm ci` instead of `npm install` for faster installs

## Updating Your Deployment

When you push changes to GitHub:

1. Render automatically detects the push
2. Triggers a new build and deployment
3. Monitor the deployment in the Render dashboard

### Manual Deploy

If auto-deploy is disabled:
1. Go to Render Dashboard → Your Service
2. Click "Manual Deploy" → "Deploy latest commit"

## Monitoring

### Viewing Logs

Real-time logs are available in:
- Render Dashboard → Your Service → Logs

### Health Checks

Render automatically monitors your service:
- Health check endpoint: `/health` (if configured)
- Automatic restart on crashes

## Security Checklist

Before going live:

- [ ] Changed `SESSION_SECRET` from default value
- [ ] Using strong database password
- [ ] Firebase authorized domains configured
- [ ] Environment variables properly set
- [ ] SSL/HTTPS enabled (automatic on Render)
- [ ] Database SSL mode enabled

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Review deployment logs carefully
3. Test locally with `NODE_ENV=production npm start`
4. Verify all environment variables are set correctly

# Quick Deployment Checklist for Render

Use this checklist to ensure your Render deployment is properly configured.

## ✅ Pre-Deployment Checklist

### 1. Code Changes
- [x] Session cookies configured for production (HTTPS, secure, sameSite)
- [x] CORS middleware added to `server/index.ts`
- [x] Firebase config supports environment variables
- [x] API base URL logic handles production correctly

### 2. Environment Variables Setup

Go to Render Dashboard → Your Service → Environment and add:

#### Required (Copy these exactly)
```bash
NODE_ENV=production
```

#### Database (Use your value from .env)
```bash
DATABASE_URL=postgresql://neondb_owner:npg_BiANFhq21kVc@ep-sparkling-art-ahmkor6n.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Session Secret (Generate NEW value!)
```bash
# Run this command locally to generate:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

SESSION_SECRET=YOUR_GENERATED_SECRET_HERE
```

### 3. Firebase Setup

#### Option A: Use Default Config (Easiest)
- ✅ Nothing to do! The app will use the hardcoded Firebase config

#### Option B: Use Custom Firebase Project
Add these to Render environment variables:
```bash
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
```

### 4. Firebase Console Configuration

1. Go to: https://console.firebase.google.com
2. Select your project: `nocturne-web1` (or your custom project)
3. Navigate to: **Authentication → Settings → Authorized Domains**
4. Click "Add Domain"
5. Add your Render domain: `your-app-name.onrender.com`
   - Example: `nocturne.onrender.com`
6. Save changes

### 5. Render Build Settings

Verify these are set correctly in Render:

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Node Version | 18.x or higher |
| Auto-Deploy | ✅ Enabled (from main branch) |

## 🚀 Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix production authentication with session cookies and CORS"
   git push origin main
   ```

2. **Render will auto-deploy** (if enabled)
   - Monitor the deployment in Render dashboard
   - Watch the build logs for errors

3. **Or manually deploy**
   - Go to Render Dashboard → Your Service
   - Click "Manual Deploy" → "Deploy latest commit"

## 🧪 Testing After Deployment

### 1. Test Authentication Flow
- [ ] Visit your Render URL (e.g., `https://nocturne.onrender.com`)
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow in popup
- [ ] **Verify:** You're redirected to home page (NOT stuck on login!)
- [ ] **Verify:** You see your profile/username in the UI

### 2. Test Session Persistence
- [ ] After successful login, refresh the page (F5)
- [ ] **Verify:** You're still logged in (don't get redirected to login)
- [ ] Open a new tab, visit the site
- [ ] **Verify:** Still logged in

### 3. Test Authentication Features
- [ ] Navigate to different pages (Diaries, Cafe, etc.)
- [ ] **Verify:** Content loads correctly
- [ ] Create a post/whisper
- [ ] **Verify:** Your content is saved with your user ID
- [ ] Logout
- [ ] **Verify:** Redirected to login page

### 4. Inspect Session Cookie (Browser DevTools)
- [ ] Press F12 to open DevTools
- [ ] Go to: **Application → Cookies** (Chrome) or **Storage → Cookies** (Firefox)
- [ ] Find your Render domain
- [ ] Look for cookie named: `connect.sid`
- [ ] **Verify attributes:**
  - ✅ Secure: Yes
  - ✅ HttpOnly: Yes
  - ✅ SameSite: None (or Lax)

## ❌ Troubleshooting

### Still Stuck on Login Page?

**Check in this order:**

1. **View Render Logs**
   ```
   Render Dashboard → Your Service → Logs
   
   Look for:
   ✓ "Server started on port 10000"
   ✓ "Environment: production"
   ✓ "Testing database connection..."
   ✓ "Firebase initialized successfully"
   
   Watch for errors:
   ✗ 401 errors on /api/user
   ✗ Database connection errors
   ✗ Session errors
   ```

2. **Check Browser Console (F12)**
   ```
   Look for:
   ✗ CORS errors
   ✗ Firebase errors
   ✗ 401/403 errors on API calls
   ✗ Cookie warnings
   ```

3. **Verify Environment Variables**
   ```
   Render Dashboard → Your Service → Environment
   
   Confirm all three are set:
   ✓ NODE_ENV=production
   ✓ DATABASE_URL=(your Neon URL)
   ✓ SESSION_SECRET=(your generated secret)
   ```

4. **Check Firebase Authorized Domains**
   ```
   Firebase Console → Authentication → Settings
   
   Confirm your Render domain is listed:
   ✓ your-app-name.onrender.com
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| Popup blocked | Check browser popup settings, add Render domain to allowed list |
| CORS error | Verify CORS middleware is in `server/index.ts` |
| 401 on `/api/user` | Check SESSION_SECRET is set, verify cookie is being sent |
| Firebase error | Verify authorized domains in Firebase Console |
| Slow first load | Normal for Render free tier (15min timeout), consider paid tier |

## 📝 Post-Deployment Notes

### Security Reminders
- ⚠️ **Change SESSION_SECRET** - Don't use the example value!
- ⚠️ **Don't commit .env files** - Keep secrets in Render environment variables only
- ✅ **HTTPS automatic** - Render provides SSL by default

### Performance
- **Free tier cold starts**: First request after inactivity takes 30-60 seconds
- **Upgrade to paid**: For production apps, consider Render Starter plan for faster response

### Monitoring
- **Logs**: Available in Render Dashboard → Logs
- **Metrics**: Check Render Dashboard for CPU/memory usage
- **Uptime**: Free tier spins down after 15min inactivity

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Can sign in with Google without getting stuck
- ✅ Session persists after page refresh
- ✅ Can navigate all pages while logged in
- ✅ Can create content (whispers, posts, etc.)
- ✅ No console errors in browser
- ✅ No 401/403 errors in Render logs

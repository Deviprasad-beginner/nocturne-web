# Render Environment Variables Setup

## 🔐 Copy These EXACT Values to Render

Go to your Render Dashboard → Your Web Service → Environment tab, then add these variables:

---

### 1. NODE_ENV
```
production
```

---

### 2. DATABASE_URL
```
YOUR_NEON_DATABASE_URL_HERE
```

---

### 3. SESSION_SECRET (🔒 IMPORTANT - Generate fresh!)
```
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
YOUR_GENERATED_SECRET_HERE
```

---

### 4. FRONTEND_URL (Optional but recommended)
```
https://your-app-name.onrender.com
```
⚠️ Replace `your-app-name` with your actual Render service name

---

## 📋 Step-by-Step Instructions

### In Render Dashboard:

1. **Navigate**: Dashboard → Your Service → "Environment" (left sidebar)

2. **Add Each Variable**:
   - Click "Add Environment Variable"
   - Enter **Key** (e.g., `NODE_ENV`)
   - Enter **Value** (e.g., `production`)
   - Click "Add" or "Save"
   - Repeat for all 4 variables

3. **Save Changes**:
   - After adding all variables, click "Save Changes" button at the top
   - Render will automatically redeploy your service

4. **Monitor Deployment**:
   - Go to "Logs" tab
   - Watch for: "Server started on port 10000"
   - Watch for: "Environment: production"

---

## 🔥 Firebase Configuration

After Render deployment starts, configure Firebase:

1. **Visit**: https://console.firebase.google.com
2. **Select Project**: `nocturne-web1`
3. **Navigate**: Authentication → Settings → Authorized domains
4. **Add Domain**: Click "Add domain" button
5. **Enter**: `your-app-name.onrender.com` (your actual Render URL)
6. **Save**: Click "Add"

---

## ✅ Verification Checklist

After deployment completes:

- [ ] All 4 environment variables are set in Render
- [ ] Render deployment shows "Live" status
- [ ] Logs show "Server started on port 10000"
- [ ] Logs show "Environment: production"
- [ ] Firebase authorized domains includes your Render URL
- [ ] Visit your Render URL - site loads
- [ ] Click "Sign in with Google" - popup opens
- [ ] Complete authentication - redirects to home (not stuck!)
- [ ] Refresh page - still logged in

---

## 🚨 Troubleshooting

### If deployment fails:
1. Check Render logs for errors
2. Verify DATABASE_URL is correct (no extra spaces/quotes)
3. Ensure SESSION_SECRET is the full string

### If authentication still gets stuck:
1. Verify Firebase authorized domain is added
2. Check browser DevTools → Console for errors
3. Check browser DevTools → Application → Cookies for `connect.sid`
4. Verify all 4 environment variables are set

### If you see CORS errors:
1. Check FRONTEND_URL matches your exact Render URL
2. Verify it includes `https://` and no trailing slash

---

## 📝 Important Notes

- **SESSION_SECRET**: Never commit this to git! Only use in Render environment
- **DATABASE_URL**: Already in your `.env` but should also be in Render
- **FRONTEND_URL**: Use your actual Render URL (e.g., `https://nocturne.onrender.com`)
- **Redeployment**: Any change to env vars triggers automatic redeploy

---

## 🎯 Your Render URL

You'll find your Render URL in:
- Render Dashboard → Your Service → (top of page)
- Format: `https://your-service-name.onrender.com`

Use this URL for:
1. FRONTEND_URL environment variable
2. Firebase authorized domains
3. Testing your live site

---

**Once you've set these up in Render, your authentication will work perfectly in production! 🚀**

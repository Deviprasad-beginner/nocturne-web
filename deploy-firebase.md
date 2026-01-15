# Firebase Deployment Guide for Nocturne

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Create a new Firebase project at https://console.firebase.google.com

## Deployment Steps

### 1. Initialize Firebase Project
```bash
firebase init
```
Select:
- Functions: Configure a Cloud Functions directory and its files
- Hosting: Configure files for Firebase Hosting and (optionally) GitHub Action deploys

### 2. Set Environment Variables
```bash
firebase functions:config:set app.database_url="YOUR_DATABASE_URL"
firebase functions:config:set app.session_secret="YOUR_SESSION_SECRET"
```

### 3. Install Dependencies
```bash
cd functions
npm install
cd ..
```

### 4. Build the Project
```bash
npm run build
```

### 5. Deploy to Firebase
```bash
firebase deploy
```

## Important Notes

### Database Setup
- Set up your PostgreSQL database (Neon recommended)
- Add the DATABASE_URL to Firebase Functions config
- Run database migrations if needed

### Authentication
- The app is configured to use Replit Auth
- For Firebase deployment, you may need to configure additional OAuth providers
- Update redirect URLs in your OAuth provider settings

### WebSocket Limitations
- Firebase Functions don't support WebSocket connections
- Real-time features (video chat) may need alternative implementation using:
  - Firebase Realtime Database
  - Firestore real-time listeners
  - Third-party WebRTC services

### Environment Variables
Required environment variables for production:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Your Firebase hosting domain
- `ISSUER_URL`: OAuth issuer URL (for Replit Auth)

### Security
- Update CORS settings for your domain
- Configure Firebase security rules
- Review and update authentication providers

## Monitoring
- Use Firebase Console for monitoring
- Set up error reporting
- Monitor function performance and costs

## Troubleshooting
- Check Firebase Functions logs: `firebase functions:log`
- Test locally: `firebase emulators:start`
- Verify environment variables: `firebase functions:config:get`
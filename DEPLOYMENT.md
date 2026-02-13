# Deployment Guide - ChatCore

Complete guide to deploy your ChatCore application to production.

---

## Prerequisites

- ✅ Code pushed to GitHub
- ✅ MongoDB Atlas database (already set up)
- ✅ Groq API key (already configured)
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Render account (free)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

1. **Ensure your `.gitignore` includes:**

   ```
   node_modules/
   .env
   logs/*.log
   ```

2. **Push to GitHub** (if not already done):
   ```bash
   cd c:\chatgpt_clone\ai_chatbot
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Go to Render:**
   - Visit https://render.com
   - Sign in with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Select "Connect a repository"
   - Find and select your `chatgpt_clone` or `ai_chatbot` repository

3. **Configure Web Service:**

   ```
   Name:           chatcore-backend (or any name)
   Region:         Choose closest to you
   Branch:         main
   Root Directory: backend
   Runtime:        Node
   Build Command:  npm install
   Start Command:  node server.js
   Instance Type:  Free
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"

   Add these one by one (use YOUR actual values from your local .env file):

   ```
   MONGO_URI=your_mongodb_connection_string

   GROQ_API_KEY=your_groq_api_key

   JWT_SECRET=your_jwt_secret

   JWT_REFRESH_SECRET=your_jwt_refresh_secret

   NODE_ENV=production

   FRONTEND_URL=https://your-app-name.vercel.app
   ```

   **Note:** You'll update `FRONTEND_URL` after deploying frontend

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Copy your backend URL (e.g., `https://chatcore-backend.onrender.com`)

### Step 3: Verify Backend

- Visit: `https://your-backend-url.onrender.com`
- You should see: "Backend is running"

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend API URL

1. **Open:** `c:\chatgpt_clone\ai_chatbot\.env`

2. **Update with your Render backend URL:**

   ```env
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Save and commit:**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

### Step 2: Deploy on Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Find and import your repository

3. **Configure Project:**

   ```
   Framework Preset: Create React App
   Root Directory:   ./
   Build Command:    npm run build
   Output Directory: build
   Install Command:  npm install
   ```

4. **Add Environment Variables:**
   Click "Environment Variables"

   Add:

   ```
   Name:  REACT_APP_API_URL
   Value: https://your-backend-url.onrender.com/api
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your frontend URL (e.g., `https://chatcore.vercel.app`)

### Step 3: Update Backend CORS

1. **Go back to Render dashboard**
2. **Select your backend service**
3. **Go to Environment**
4. **Update `FRONTEND_URL` variable:**
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. **Save Changes** - Backend will auto-redeploy

---

## Part 3: Final Testing

### Test Your Deployed App:

1. **Visit your Vercel URL** (frontend)
2. **Sign up** for a new account
3. **Login** with your credentials
4. **Send a message** to the AI
5. **Create a new chat** session
6. **Verify chat history** works

---

## Troubleshooting

### Backend Issues:

**Problem:** Backend won't start

- Check Render logs: Dashboard → Logs
- Verify all environment variables are set
- Check MongoDB connection string

**Problem:** CORS errors

- Update `FRONTEND_URL` in Render
- Make sure it matches your exact Vercel URL (no trailing slash)

### Frontend Issues:

**Problem:** Can't connect to backend

- Check `REACT_APP_API_URL` is correct
- Verify backend is running (visit backend URL)
- Check browser console for errors

**Problem:** Environment variables not working

- Vercel requires `REACT_APP_` prefix for React
- Redeploy after adding env vars

---

## Auto-Deployment (Future Updates)

✅ **Frontend:** Vercel auto-deploys when you push to GitHub
✅ **Backend:** Render auto-deploys when you push to GitHub

Just push your changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Both will automatically redeploy! 🚀

---

## Free Tier Limits

### Vercel (Frontend):

- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ 100 GB-hours/month

### Render (Backend):

- ⚠️ Spins down after 15 min of inactivity
- ⚠️ First request after sleep takes ~30 seconds
- ✅ 750 hours/month free
- ✅ Automatic HTTPS

**Tip:** Backend will be slow on first request after being idle. This is normal for free tier!

---

## Security Notes

🔒 **Never commit:**

- `.env` files
- API keys
- Database passwords
- JWT secrets

✅ **Always:**

- Use environment variables on hosting platforms
- Keep `.env` in `.gitignore`
- Use strong JWT secrets in production
- Enable MongoDB IP whitelist (or use 0.0.0.0/0 for access from anywhere)

---

## Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Groq API:** https://console.groq.com

---

## Need Help?

If deployment fails:

1. Check the logs in Render/Vercel dashboard
2. Verify all environment variables
3. Test backend URL directly in browser
4. Check MongoDB Atlas is running and accessible

---

**🎉 Congratulations!** Your ChatCore app is now live and accessible worldwide!

# Deployment Guide - Vercel + Render

This guide will walk you through deploying your AI Chatbot to production using **Vercel** (frontend) and **Render** (backend).

## 📋 Prerequisites

Before you start, make sure you have:

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com) - free)
- Render account (sign up at [render.com](https://render.com) - free)
- Your MongoDB Atlas connection string
- Your Google Gemini API key

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub
2. In your terminal, run:

```bash
cd c:\chatgpt_clone\ai_chatbot
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `chatbot-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables

In the Render dashboard, scroll to **"Environment Variables"** and add:

| Key                  | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| `NODE_ENV`           | `production`                                                |
| `PORT`               | `5000`                                                      |
| `MONGO_URI`          | Your MongoDB Atlas connection string                        |
| `GEMINI_KEY`         | Your Google Gemini API key                                  |
| `JWT_SECRET`         | `mysupersecretkey123` (or generate a new one)               |
| `JWT_REFRESH_SECRET` | `myrefreshsecretkey456` (or generate a new one)             |
| `FRONTEND_URL`       | Leave blank for now (we'll add it after deploying frontend) |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the deployment to complete (~2-3 minutes)
3. **Copy your backend URL** (e.g., `https://chatbot-backend-abc123.onrender.com`)

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 2: Add Environment Variable

Before deploying, add this environment variable:

| Key                 | Value                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `REACT_APP_API_URL` | Your Render backend URL + `/api` (e.g., `https://chatbot-backend-abc123.onrender.com/api`) |

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~1-2 minutes)
3. **Copy your frontend URL** (e.g., `https://your-chatbot.vercel.app`)

---

## 🔄 Part 3: Update Backend CORS

Now that you have your frontend URL, you need to update your backend:

1. Go back to **Render Dashboard**
2. Select your backend service
3. Go to **"Environment"** tab
4. Add or update the `FRONTEND_URL` variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your Vercel URL (e.g., `https://your-chatbot.vercel.app`)
5. Click **"Save Changes"**
6. Your backend will automatically redeploy

---

## ✅ Part 4: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try signing up with a new account
3. Login and send a message to the AI
4. Check that chat history persists

---

## 🔧 Common Issues & Solutions

### Issue: "Network error" when logging in

**Solution**: Make sure `FRONTEND_URL` in Render matches your exact Vercel URL (no trailing slash)

### Issue: Backend deployment fails

**Solution**: Check Render logs. Common causes:

- Missing environment variables
- Wrong Node.js version (Render uses latest by default)

### Issue: Frontend shows "Cannot connect to server"

**Solution**: Verify `REACT_APP_API_URL` in Vercel includes `/api` at the end

### Issue: CORS errors in browser console

**Solution**:

- Make sure `FRONTEND_URL` in Render backend exactly matches your Vercel URL
- Check browser console for the exact origin being blocked

---

## 🔄 Updating Your Deployment

### Update Frontend:

Just push to GitHub - Vercel auto-deploys on every push to `main` branch

### Update Backend:

Push to GitHub - Render auto-deploys on every push to `main` branch

---

## 💰 Cost Breakdown

- **Vercel**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month - note: free tier sleeps after 15 min inactivity)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

### Note About Render Free Tier:

The free tier backend "sleeps" after 15 minutes of inactivity. First request after sleeping takes ~30 seconds to wake up. For 24/7 uptime, upgrade to Render's $7/month plan.

---

## 📝 Environment Variables Quick Reference

### Backend (Render)

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/...
GEMINI_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=https://your-chatbot.vercel.app
```

### Frontend (Vercel)

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 🎉 You're Live!

Your AI Chatbot is now deployed and accessible worldwide! Share your Vercel URL with others to try it out.

**Questions or issues?** Check the logs:

- **Vercel logs**: Project → Deployments → Click on deployment
- **Render logs**: Service → Logs tab

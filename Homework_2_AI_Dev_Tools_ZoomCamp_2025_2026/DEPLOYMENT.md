# Quick Deployment Guide - Render.com (Recommended)

## Why Render.com?

- ✅ **Free tier** - No credit card required
- ✅ **WebSocket support** - Works with our real-time features
- ✅ **Auto-deploy** - Git push to deploy
- ✅ **5-minute setup** - Fastest deployment
- ✅ **Free HTTPS/SSL** - Secure by default
- ✅ **Good uptime** - Better than Heroku free tier

## Deployment Steps (5 minutes)

### 1. Prepare Your Repository

First, push your code to GitHub:

```bash
cd coding-interview-platform
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/coding-interview-platform.git
git push -u origin main
```

### 2. Create render.yaml

Create this file in your project root:

```yaml
services:
  - type: web
    name: coding-interview-platform
    env: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

Commit and push:
```bash
git add render.yaml
git commit -m "Add Render config"
git push
```

### 3. Deploy on Render

1. Go to https://render.com
2. Sign up (GitHub login recommended)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render auto-detects the Docker config
6. Click "Create Web Service"

**That's it!** 🎉

Your app will be live at: `https://your-app-name.onrender.com`

## Configuration

Render will automatically:
- ✅ Build your Docker image
- ✅ Deploy the container
- ✅ Provide HTTPS
- ✅ Set up health checks
- ✅ Auto-redeploy on Git push

## Custom Domain (Optional)

In Render dashboard:
1. Settings → Custom Domains
2. Add your domain
3. Update DNS records as shown

## Environment Variables

If needed, add in Render dashboard:
- Dashboard → Environment
- Add variables like `BASE_URL`

## Free Tier Details

**What's Included:**
- 750 hours/month free
- 512 MB RAM
- Shared CPU
- WebSocket support ✅
- HTTPS/SSL ✅
- Auto-deploy from Git ✅

**Limitations:**
- Spins down after 15 min inactivity
- First request after sleep: 30-60 second cold start
- Shared resources (slower than paid)

**Perfect for:**
- ✅ Demos
- ✅ Portfolio projects
- ✅ Proof of concepts
- ✅ Technical interviews

## Monitoring

**View logs:**
1. Dashboard → Your Service
2. Logs tab
3. Real-time log streaming

**Metrics:**
- CPU usage
- Memory usage
- Request counts
- Response times

## Keeping It Awake (Optional)

To prevent sleeping, use a ping service:

**Option 1: Cron-job.org**
1. Sign up at https://cron-job.org
2. Create job to ping `https://your-app.onrender.com/health` every 10 minutes

**Option 2: UptimeRobot**
1. Sign up at https://uptimerobot.com
2. Add monitor for your URL
3. Check interval: 5 minutes

## Updating Your App

Just push to Git:

```bash
git add .
git commit -m "Update features"
git push
```

Render auto-deploys! ✨

## Troubleshooting

### WebSocket Issues

Update `frontend/src/App.jsx` to use the Render URL:

```javascript
const wsUrl = window.location.protocol === 'https:' 
  ? `wss://${window.location.host}`
  : `ws://${window.location.host}`;
```

This is already in your code! ✅

### Build Fails

Check logs in Render dashboard:
- Look for missing dependencies
- Check Dockerfile syntax
- Verify all files are committed

### Slow After Sleep

This is expected on free tier. Options:
1. Use ping service (see above)
2. Upgrade to paid tier ($7/mo, no sleep)
3. Accept 30-60s cold start

## Cost

**Free Forever:**
- Web services (with sleep)
- PostgreSQL databases (90 days retention)
- Static sites
- Cron jobs

**Paid Tier** ($7/mo):
- No sleep
- More RAM (2 GB)
- Better performance

## Alternative: Railway.app

If Render doesn't work, try Railway:

1. Sign up at https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-deploys

**Railway Free Tier:**
- $5 credit/month
- ~100-200 hours free
- No credit card needed
- Excellent for demos

## Comparison: Render vs Others

| Platform | Free Tier | WebSockets | Setup Time | Sleep |
|----------|-----------|------------|------------|-------|
| **Render** | ✅ 750 hrs | ✅ Yes | 5 min | 15 min |
| Railway | ✅ $5/mo | ✅ Yes | 5 min | No |
| Heroku | ❌ Removed | ✅ Yes | 10 min | - |
| Vercel | ✅ Unlimited | ⚠️ Limited | 3 min | No |
| Netlify | ✅ Unlimited | ❌ No | 3 min | No |
| Fly.io | ✅ Limited | ✅ Yes | 10 min | No |

## My Recommendation

**For interviews/demos:**
1. **Render.com** - Best all-around free option
2. **Railway.app** - If you need no-sleep
3. **Fly.io** - If you need global deployment

**For production:**
1. Render paid ($7/mo) - Simple, reliable
2. DigitalOcean App Platform ($5/mo) - Good value
3. AWS ECS - Scalable but complex

## Next Steps

1. Push code to GitHub
2. Sign up on Render.com
3. Connect repository
4. Deploy! 🚀

Your coding interview platform will be live in 5 minutes!

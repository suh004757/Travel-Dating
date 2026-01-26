# Seoul Date Itinerary - Deployment Guide

## Quick Start (5 minutes)

### Step 1: Get Kakao Maps API Key

1. Go to https://developers.kakao.com/
2. Click "시작하기" (Get Started)
3. Sign up with Kakao account
4. Create new app: "Seoul Date Map"
5. Go to app settings → Platform → Web
6. Add site domain: `http://localhost` (for testing)
7. Copy JavaScript key

### Step 2: Update API Key

Open `index.html` and replace line 8:

```html
<!-- BEFORE -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&libraries=services"></script>

<!-- AFTER -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=abc123yourkey456&libraries=services"></script>
```

### Step 3: Test Locally

Just double-click `index.html` to open in browser!

### Step 4: Deploy to GitHub Pages

```bash
# In the seoul-date-itinerary folder
git init
git add .
git commit -m "Seoul romantic date itinerary"

# Create new repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR-USERNAME/seoul-date-itinerary.git
git branch -M main
git push -u origin main
```

Then on GitHub:
1. Go to repository **Settings**
2. Click **Pages** (left sidebar)
3. Source: **Deploy from a branch**
4. Branch: **main** / folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes
7. Visit: `https://YOUR-USERNAME.github.io/seoul-date-itinerary/`

### Step 5: Update Kakao API for GitHub Pages

Go back to Kakao Developers:
1. App Settings → Platform → Web
2. Add site domain: `https://YOUR-USERNAME.github.io`
3. Save

Done! 🎉

## Features You'll See

✅ Interactive map with all locations  
✅ Click markers to see details  
✅ Filter by day (Feb 10/11/12)  
✅ Filter by type (Restaurants/Activities)  
✅ Search restaurants and activities  
✅ Suggested daily routes  
✅ Direct links to reservation platforms  
✅ Mobile-friendly design  

## Troubleshooting

**Map not showing?**
- Check if API key is correct in `index.html`
- Check browser console (F12) for errors
- Make sure domain is registered in Kakao Developers

**Markers not appearing?**
- Coordinates might be slightly off
- Check `data.js` for valid lat/lng values

**GitHub Pages not working?**
- Wait 2-3 minutes after first deployment
- Check repository is public
- Verify Pages is enabled in Settings

## Need Help?

Check the main README.md for more details!

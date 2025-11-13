# Quick Start Guide - Ritual Stats

## Step-by-Step Setup

### Step 1: Install Node.js
If you haven't already, download and install Node.js from https://nodejs.org/

### Step 2: Install Dependencies
Open PowerShell in the project folder and run:
```powershell
npm install
```

### Step 3: Get Your Discord Bot Token
1. Go to https://discord.com/developers/applications
2. Find your bot (ID: 1438659224417734779) or create a new one
3. Go to the "Bot" section
4. Click "Reset Token" and copy the new token
5. **IMPORTANT**: Enable these Privileged Gateway Intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Step 4: Configure the Server
1. Open `server.js`
2. Find this line:
   ```javascript
   const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
   ```
3. Replace `YOUR_BOT_TOKEN_HERE` with your actual bot token:
   ```javascript
   const BOT_TOKEN = 'MTQzODY1OTIyNDQxNzczNDc3OQ.GXX...'; // Your actual token
   ```

### Step 5: Make Sure Bot is in Your Server
Your bot needs to be in the Discord server (Guild ID: 1210468736205852672)

To invite the bot:
1. Go to Discord Developer Portal > Your App > OAuth2 > URL Generator
2. Select these scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select these permissions:
   - ✅ Read Messages/View Channels
   - ✅ Read Message History
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

### Step 6: Start the Server
```powershell
npm start
```

You should see:
```
🚀 Ritual Stats Server running on http://localhost:3000
📊 Guild ID: 1210468736205852672
🤖 Bot ID: 1438659224417734779
```

### Step 7: Open the Website
Open your browser and go to: http://localhost:3000

## Testing the Features

### Test 1: Check Live Stats
- Open the website
- Check the browser console (F12)
- You should see server statistics being fetched

### Test 2: Search for a Member
- Enter a Discord username or user ID in the search box
- Click "Search"
- You should see member information

### Test 3: View Role Holders
- Click "View role holders" button
- A new tab will open showing all roles and members

## Troubleshooting

### Error: "Failed to fetch guild stats"
- Make sure your bot token is correct in `server.js`
- Make sure the bot is in the Discord server
- Check that Privileged Gateway Intents are enabled

### Error: "Cannot find module 'express'"
- Run `npm install` again
- Make sure you're in the correct folder

### Error: "CORS policy" or "blocked"
- This is normal for production. The backend server handles CORS
- Make sure you're accessing http://localhost:3000 (not opening the HTML file directly)

### Member Search Returns 404
- Make sure you're using the correct username format (username#0000) or user ID
- The user must be in the server (Guild ID: 1210468736205852672)

## Production Deployment

For production (hosting online):
1. Never expose your bot token in client-side code
2. Use environment variables for sensitive data
3. Set up proper CORS policies
4. Use HTTPS
5. Consider using a reverse proxy (nginx)
6. Deploy backend to a service like Heroku, Railway, or DigitalOcean

## Need Help?

Common issues:
- Bot token is invalid → Reset token in Discord Developer Portal
- Bot not in server → Use OAuth2 URL to invite bot
- Intents not enabled → Enable Privileged Gateway Intents in Developer Portal

Created by Rakuten

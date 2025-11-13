# Ritual Stats - Discord Statistics Dashboard

A modern Discord statistics dashboard for the Ritual community.

## Features

- 📊 Live server statistics
- 👥 Member search and profiles
- 🏆 Leaderboard tracking
- 🎭 Role holder views
- 📈 Activity monitoring

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or use existing bot ID: `1438659224417734779`)
3. Go to "Bot" section and copy your bot token
4. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent (if tracking messages)

### 3. Invite Bot to Server

1. Go to OAuth2 > URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - Read Messages/View Channels
   - Read Message History
   - View Server Insights (if available)
4. Use the generated URL to invite bot to guild ID: `1210468736205852672`

### 4. Configure Server

1. Open `server.js`
2. Replace `YOUR_BOT_TOKEN_HERE` with your actual bot token
3. Verify `GUILD_ID` and `BOT_ID` are correct

### 5. Run the Server

Development mode (auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on http://localhost:3000

## API Endpoints

- `GET /api/guild/:guildId/stats` - Get server statistics
- `GET /api/guild/:guildId/member/:userId` - Get member information
- `GET /api/guild/:guildId/roles` - Get all roles and role holders
- `GET /api/guild/:guildId/leaderboard` - Get top members
- `GET /api/health` - Health check endpoint

## Configuration

### Guild ID
`1210468736205852672`

### Bot ID
`1438659224417734779`

## Security Notes

⚠️ **NEVER commit your bot token to Git!**

- Keep your bot token in `server.js` or use environment variables
- Add `.env` to `.gitignore`
- Use a reverse proxy (nginx) for production
- Consider rate limiting for API endpoints

## Technologies Used

- Node.js
- Express.js
- Discord API v10
- Axios
- HTML/CSS/JavaScript

## Created By

Rakuten

## License

MIT

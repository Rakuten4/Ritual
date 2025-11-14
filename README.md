# Ritual Stats - Discord Statistics Dashboard

A modern Discord statistics dashboard for the Ritual community with MySQL database integration.

## Features

- 📊 Live server statistics
- 👥 Member search and profiles with XP and ranks
- 🏆 Real-time leaderboard tracking
- 🎭 Role holder views
- 📈 Activity monitoring and logging
- 💾 MySQL database for persistent data storage
- ⚡ XP and leveling system
- 📝 Message tracking and analytics

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MySQL Database

See [MYSQL_SETUP.md](MYSQL_SETUP.md) for detailed instructions.

Quick setup:
1. Install MySQL or XAMPP
2. Run `database/schema.sql` to create tables
3. Configure database credentials in `.env`

### 3. Configure Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Use bot ID: `1438659224417734779`
3. Copy your bot token
4. Update `BOT_TOKEN` in `server.js` and `bot.js`
5. Enable these Privileged Gateway Intents:
   - Server Members Intent ✅
   - Message Content Intent ✅
   - Presence Intent ✅

### 4. Invite Bot to Server

Guild ID: `1210468736205852672`

Generate invite URL with these permissions:
- Read Messages/View Channels
- Read Message History
- Send Messages

### 5. Run the Application

**Start the web server:**
```bash
npm start
```

**Start the Discord bot (for message tracking):**
```bash
npm run bot
```

The server will run on http://localhost:3000

## Project Structure

```
RITUAL PROJECT/
├── Index.html              # Frontend website
├── server.js               # Backend API server
├── bot.js                  # Discord bot with message tracking
├── package.json            # Dependencies
├── database/
│   ├── schema.sql         # MySQL database schema
│   └── db.js              # Database utility functions
├── images/
│   └── RITUAL LOGO.jpeg   # Logo image
├── README.md              # This file
├── MYSQL_SETUP.md         # Database setup guide
├── MYSQL_INTEGRATION.md   # Integration details
└── QUICKSTART.md          # Quick setup guide
```

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

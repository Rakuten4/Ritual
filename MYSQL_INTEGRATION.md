# MySQL Integration Summary

## ✅ What's Been Set Up

### 1. Database Schema (`database/schema.sql`)
Complete MySQL database structure with tables for:
- **Members** - Discord user profiles
- **Member Stats** - Message counts, XP, levels, voice activity
- **Messages** - Message history logging
- **Roles** - Server roles
- **Member Roles** - Role assignments
- **Daily Stats** - Daily snapshots of server activity
- **Leaderboard Cache** - Fast leaderboard queries
- **Activity Logs** - Recent activity feed (joins, level ups, etc.)
- **Server Stats** - Historical server statistics

### 2. Database Module (`database/db.js`)
Full-featured database wrapper with functions for:
- Member management (insert, update, search)
- Statistics tracking (messages, XP, levels)
- Leaderboard generation
- Activity logging
- Role management
- Daily statistics
- Server snapshots

### 3. Updated Server (`server.js`)
API endpoints now integrated with MySQL:
- `/api/guild/:guildId/stats` - Shows database stats + Discord stats
- `/api/guild/:guildId/member/:userId` - Returns member + DB stats (messages, XP, rank)
- `/api/guild/:guildId/leaderboard` - Real leaderboard from database
- `/api/guild/:guildId/activities` - Recent activities from database
- `/api/guild/:guildId/roles` - Roles synced to database

### 4. Dependencies Installed
- ✅ mysql2 - MySQL driver for Node.js
- ✅ dotenv - Environment variable management

### 5. Documentation Created
- `MYSQL_SETUP.md` - Complete MySQL installation and setup guide
- `.env.example` - Updated with database configuration

## 🎯 How It Works

### Data Flow
```
Discord Event → Bot Receives → Store in MySQL → API Returns Data → Frontend Displays
```

### XP System
- **10 XP per message**
- **Level = √(Total XP / 100)**
- Automatic ranking based on total XP

### Tracking Features
1. **Message Tracking** - Every message increments counter and awards XP
2. **Voice Tracking** - Track voice channel time
3. **Activity Logging** - Member joins, leaves, level ups, role changes
4. **Daily Snapshots** - Store daily server statistics
5. **Leaderboard** - Automatically ranked by XP

## 📋 Next Steps to Complete Setup

### Step 1: Install MySQL
Choose one option:
- **Option A**: Install MySQL Server (https://dev.mysql.com/downloads/installer/)
- **Option B**: Install XAMPP (https://www.apachefriends.org/) - Easier!

### Step 2: Create Database
Run the schema.sql file:
```sql
source C:/Users/user/Desktop/RITUAL PROJECT/database/schema.sql
```

Or use MySQL Workbench or phpMyAdmin (see MYSQL_SETUP.md)

### Step 3: Configure Environment
1. Create `.env` file from `.env.example`
2. Add your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ritual_stats
```

### Step 4: Start Server
```bash
npm start
```

You should see:
```
✅ Database connected successfully
```

## 🤖 Discord Bot Message Tracking

To actually track messages, you need to add Discord.js event handlers to your bot.

### Example Bot Code (bot.js)
```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const Database = require('./database/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Log message and award XP
    await Database.logMessage({
        id: message.id,
        memberId: message.author.id,
        channelId: message.channel.id,
        content: message.content.substring(0, 500), // Store first 500 chars
        createdAt: message.createdAt,
        hasAttachment: message.attachments.size > 0
    });
    
    // Check for level up
    const member = await Database.getMemberById(message.author.id);
    const newLevel = Math.floor(Math.sqrt(member.total_xp / 100));
    
    if (newLevel > member.level) {
        await Database.updateMemberStats(message.author.id, { level: newLevel });
        await Database.logActivity(
            'level_up',
            message.author.id,
            `${message.author.username} reached level ${newLevel}!`
        );
    }
});

client.on('guildMemberAdd', async (member) => {
    await Database.upsertMember({
        id: member.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        displayName: member.displayName,
        avatarUrl: member.user.displayAvatarURL(),
        joinedAt: member.joinedAt
    });
    
    await Database.logActivity(
        'member_join',
        member.id,
        `${member.user.username} joined the server`
    );
});

client.login('YOUR_BOT_TOKEN');
```

## 📊 API Endpoints with Database

### Get Member Stats
```
GET /api/guild/1210468736205852672/member/username
```
Returns:
```json
{
  "id": "123456789",
  "username": "CryptoKing",
  "messageCount": 2847,
  "totalXp": 9847,
  "level": 45,
  "rank": 1
}
```

### Get Leaderboard
```
GET /api/guild/1210468736205852672/leaderboard?limit=10
```
Returns top 10 members by XP

### Get Recent Activities
```
GET /api/guild/1210468736205852672/activities?limit=10
```
Returns last 10 activities (joins, level ups, etc.)

## 🔒 Security Notes

1. **Never commit .env file** - Already in .gitignore
2. **Use strong MySQL password**
3. **Don't store message content** - Privacy concern (only store counts)
4. **Limit API rate** - Consider adding rate limiting
5. **Sanitize inputs** - Prevent SQL injection (using parameterized queries)

## 📈 Database Maintenance

### Regular Tasks
- Backup database weekly
- Clear old messages (90+ days)
- Optimize tables monthly
- Monitor database size

### Performance
- Indexed columns for fast queries
- Leaderboard cache table
- Efficient join queries
- Connection pooling enabled

## Created By
Rakuten

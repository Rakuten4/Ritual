# ✅ MySQL Database Integration - Complete!

## What We've Built

Your Ritual Stats project now has **full MySQL database integration** with persistent data storage and real-time Discord tracking!

## 📦 Files Created

### Database Files
- ✅ `database/schema.sql` - Complete database structure (9 tables)
- ✅ `database/db.js` - Database utility module with 20+ functions
- ✅ `bot.js` - Discord bot that tracks messages and updates database

### Documentation
- ✅ `MYSQL_SETUP.md` - Step-by-step MySQL installation guide
- ✅ `MYSQL_INTEGRATION.md` - Complete integration documentation
- ✅ Updated `README.md` - Project overview with MySQL info

### Configuration
- ✅ Updated `package.json` - Added mysql2, dotenv, discord.js
- ✅ Updated `.env.example` - Database configuration template
- ✅ Updated `server.js` - Integrated database with API endpoints

## 🗄️ Database Tables

1. **members** - Discord user profiles
2. **member_stats** - Messages, XP, levels, voice time
3. **messages** - Message history
4. **roles** - Server roles
5. **member_roles** - Role assignments
6. **daily_stats** - Daily server snapshots
7. **leaderboard_cache** - Fast leaderboard queries
8. **activity_logs** - Recent activities (joins, level ups, etc.)
9. **server_stats** - Historical server data

## 🎯 Features Implemented

### Real-Time Tracking
- ✅ Message counting per member
- ✅ XP system (10 XP per message)
- ✅ Automatic leveling (Level = √(XP/100))
- ✅ Member join/leave tracking
- ✅ Role change tracking
- ✅ Daily statistics snapshots

### API Endpoints (Enhanced)
- ✅ `/api/guild/:id/stats` - Shows DB stats + Discord stats
- ✅ `/api/guild/:id/member/:userId` - Member profile with XP, rank, level
- ✅ `/api/guild/:id/leaderboard` - Real leaderboard from database
- ✅ `/api/guild/:id/activities` - Recent activity feed
- ✅ `/api/guild/:id/roles` - Roles synced to database

### Frontend Features
- ✅ Live member count from database
- ✅ Total messages displayed
- ✅ Active members today
- ✅ Leaderboard with real stats
- ✅ Recent activity feed

## 🚀 How to Use

### Option 1: Quick Test (Without MySQL)
```bash
npm start
```
Website will work, but no persistent data storage.

### Option 2: Full Setup (With MySQL)

**Step 1: Install MySQL**
- Download XAMPP: https://www.apachefriends.org/
- Or MySQL Server: https://dev.mysql.com/downloads/installer/

**Step 2: Create Database**
```bash
# Open MySQL command line or phpMyAdmin
# Run the schema.sql file
source C:/Users/user/Desktop/RITUAL PROJECT/database/schema.sql
```

**Step 3: Configure**
Create `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ritual_stats
```

**Step 4: Run Both Services**

Terminal 1 - Web Server:
```bash
npm start
```

Terminal 2 - Discord Bot:
```bash
npm run bot
```

## 💡 How It Works

### Message Tracking Flow
```
1. User sends message in Discord
2. Bot receives 'messageCreate' event
3. Bot stores message in 'messages' table
4. Bot updates member_stats (message_count + 1, total_xp + 10)
5. Bot checks if member leveled up
6. If level up, log activity and send congrats message
7. Frontend displays updated stats
```

### Leaderboard Ranking
```sql
SELECT username, total_xp, 
       RANK() OVER (ORDER BY total_xp DESC) as rank
FROM member_stats
JOIN members ON member_stats.member_id = members.id
ORDER BY total_xp DESC
LIMIT 10
```

### XP Formula
- **Per Message**: 10 XP
- **Level Calculation**: Level = √(Total XP / 100)
- **Example**: 10,000 XP = Level 10

## 📊 Example Data Flow

### When User Sends a Message:
1. Database receives message log
2. Message count: +1
3. Total XP: +10
4. Check: Is new level reached?
5. If yes: Update level, log activity

### When Frontend Requests Leaderboard:
1. Query database for top 10 members by XP
2. Calculate rank positions
3. Return with usernames, XP, levels
4. Frontend displays in leaderboard section

## 🔧 npm Commands

```bash
npm start          # Start web server
npm run dev        # Start server with auto-reload
npm run bot        # Start Discord bot
npm run bot:dev    # Start bot with auto-reload
```

## 📝 Database Functions Available

### Member Management
- `Database.upsertMember()` - Add/update member
- `Database.getMemberById()` - Get member with stats
- `Database.searchMemberByUsername()` - Search by name

### Statistics
- `Database.updateMemberStats()` - Update XP, messages, level
- `Database.getLeaderboard()` - Get top members
- `Database.getMemberRank()` - Get member's rank

### Activities
- `Database.logActivity()` - Log events
- `Database.getRecentActivities()` - Get recent events

### Messages
- `Database.logMessage()` - Store message (auto awards XP)

### Server Stats
- `Database.getServerStatsSummary()` - Overview stats
- `Database.updateDailyStats()` - Daily snapshot

## 🎮 Testing Without Real Users

Want to test with fake data?

```sql
-- Add test members
INSERT INTO members (id, username, discriminator, display_name, joined_at)
VALUES 
  ('111111', 'TestUser1', '0001', 'Test User 1', NOW()),
  ('222222', 'TestUser2', '0002', 'Test User 2', NOW()),
  ('333333', 'TestUser3', '0003', 'Test User 3', NOW());

-- Add test stats
INSERT INTO member_stats (member_id, message_count, total_xp, level)
VALUES 
  ('111111', 5000, 15000, 12),
  ('222222', 3000, 10000, 10),
  ('333333', 2000, 7500, 8);

-- Log test activities
INSERT INTO activity_logs (activity_type, member_id, description)
VALUES 
  ('level_up', '111111', 'TestUser1 reached level 12!'),
  ('member_join', '222222', 'TestUser2 joined the server');
```

Then visit:
- http://localhost:3000/api/guild/1210468736205852672/leaderboard
- http://localhost:3000/api/guild/1210468736205852672/activities

## 🔐 Security Checklist

- ✅ Bot token not in frontend code
- ✅ Database credentials in .env (gitignored)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input sanitization
- ✅ CORS enabled for API
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add authentication for admin endpoints

## 📈 Next Steps

### Immediate
1. Install MySQL/XAMPP
2. Run schema.sql
3. Configure .env
4. Test connection: `npm start`

### Short Term
1. Run bot to start tracking: `npm run bot`
2. Send messages in Discord
3. Check leaderboard updates
4. View member profiles with stats

### Future Enhancements
- Voice channel time tracking
- Reaction tracking
- Custom commands (!rank, !level, !stats)
- Weekly/monthly leaderboards
- Achievement system
- Data visualization charts
- Export statistics to CSV
- Admin dashboard

## 🐛 Troubleshooting

### "Database connection failed"
- Check MySQL is running
- Verify .env credentials
- Test: `mysql -u root -p`

### "Unknown Guild" error
- Bot not in server
- Wrong GUILD_ID
- Check bot permissions

### "401 Unauthorized"
- Invalid bot token
- Token needs to be reset
- Check Discord Developer Portal

### Leaderboard shows no data
- Bot not running yet
- No messages tracked yet
- Add test data (see above)

## 📞 Support

- MySQL Setup: See MYSQL_SETUP.md
- Integration Details: See MYSQL_INTEGRATION.md
- Quick Start: See QUICKSTART.md
- Full Docs: See README.md

## ✨ Created By

**Rakuten**

---

**Status**: ✅ MySQL Integration Complete!  
**Last Updated**: November 14, 2025

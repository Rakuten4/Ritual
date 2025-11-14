# System Architecture - Ritual Stats

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RITUAL STATS SYSTEM                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  Discord Server  │◄────────│  Discord Bot     │────────►│  MySQL Database  │
│  (Guild)         │         │  (bot.js)        │         │  (ritual_stats)  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                             │                             ▲
        │                             │                             │
        │ Events:                     │ Tracks:                     │ Stores:
        │ • Messages                  │ • Messages                  │ • Members
        │ • Members Join/Leave        │ • Member Activity           │ • Stats
        │ • Role Changes              │ • XP/Levels                 │ • Messages
        │                             │ • Activities                │ • Roles
        │                             │                             │ • Activities
        │                             ▼                             │
        │                     ┌──────────────────┐                 │
        │                     │                  │                 │
        │                     │  Backend API     │─────────────────┘
        │                     │  (server.js)     │
        │                     │                  │
        │                     └──────────────────┘
        │                             │
        │                             │ REST API
        │                             │
        │                             ▼
        │                     ┌──────────────────┐
        │                     │                  │
        └────────────────────►│  Frontend Web    │
                              │  (Index.html)    │
                              │                  │
                              └──────────────────┘
                                      │
                                      ▼
                              ┌──────────────────┐
                              │                  │
                              │  User Browser    │
                              │                  │
                              └──────────────────┘
```

## Data Flow

### 1. Message Tracking Flow
```
User sends message in Discord
        │
        ▼
Discord Bot receives 'messageCreate' event
        │
        ▼
Bot.js processes message
        │
        ├─► Database.logMessage() → messages table
        │
        ├─► Database.updateMemberStats() → member_stats table (+1 message, +10 XP)
        │
        └─► Check for level up
                │
                ├─► Yes → Update level
                │         Log activity
                │         Send congrats
                │
                └─► No  → Continue
```

### 2. Frontend Data Request Flow
```
User visits website (http://localhost:3000)
        │
        ▼
Frontend loads Index.html
        │
        ▼
JavaScript makes API call: fetch('/api/guild/1210468736205852672/stats')
        │
        ▼
server.js receives request
        │
        ├─► Query Discord API (member count, online count)
        │
        ├─► Query MySQL Database (total messages, XP, activities)
        │
        └─► Combine data and return JSON
                │
                ▼
Frontend receives response
        │
        ▼
Update dashboard with live stats
```

### 3. Member Search Flow
```
User enters username in search box
        │
        ▼
Click "Search" button
        │
        ▼
API call: fetch('/api/guild/:guildId/member/:username')
        │
        ▼
server.js processes request
        │
        ├─► Check MySQL database first (Database.searchMemberByUsername)
        │
        ├─► Query Discord API (get member info)
        │
        ├─► Update database with latest info (Database.upsertMember)
        │
        ├─► Get member rank from database (Database.getMemberRank)
        │
        └─► Return complete member profile
                │
                ▼
Frontend displays member info:
  • Username & Avatar
  • Message Count
  • Total XP
  • Current Level
  • Server Rank
  • Join Date
  • Roles
```

## Database Schema Relationships

```
┌─────────────┐
│   members   │ (Discord users)
└──────┬──────┘
       │ 1
       │
       │ 1:1
       ▼
┌──────────────┐
│ member_stats │ (XP, levels, messages)
└──────────────┘

┌─────────────┐
│   members   │
└──────┬──────┘
       │ 1
       │
       │ 1:M
       ▼
┌──────────────┐
│   messages   │ (Message history)
└──────────────┘

┌─────────────┐         ┌──────────────┐
│   members   │ M ◄───► M │    roles     │
└──────┬──────┘         └──────────────┘
       │                        ▲
       │                        │
       └─► member_roles ◄───────┘
           (junction table)

┌──────────────┐
│   members    │
└──────┬───────┘
       │ 1
       │
       │ 1:M
       ▼
┌──────────────────┐
│  activity_logs   │ (Joins, level ups, etc.)
└──────────────────┘
```

## API Endpoints Map

```
HTTP GET Requests:

/                                           → Index.html
/api/health                                → Server status
/api/guild/:guildId/stats                  → Server statistics
/api/guild/:guildId/member/:userId         → Member profile
/api/guild/:guildId/leaderboard           → Top 10 members
/api/guild/:guildId/roles                  → All roles
/api/guild/:guildId/activities            → Recent activities
```

## Components Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                      SERVER STARTUP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Load server.js                                          │
│  2. Connect to MySQL (Database.testConnection())            │
│  3. Start Express server on port 3000                       │
│  4. Enable CORS                                             │
│  5. Register API routes                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      BOT STARTUP                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Load bot.js                                             │
│  2. Connect to Discord API                                  │
│  3. Test database connection                                │
│  4. Sync all members to database                            │
│  5. Start listening for events:                             │
│     • messageCreate                                         │
│     • guildMemberAdd                                        │
│     • guildMemberRemove                                     │
│     • guildMemberUpdate                                     │
│  6. Start hourly stats update timer                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## XP & Leveling System

```
Message Sent
     │
     ▼
+10 XP added to member_stats.total_xp
     │
     ▼
Calculate Level: √(total_xp / 100)
     │
     ├─► Level increased? ─── Yes ──► Update level
     │                                 Log activity
     │                                 Send message
     │
     └─► No change ────────────────► Continue

Example XP to Levels:
  100 XP   = Level 1
  400 XP   = Level 2
  900 XP   = Level 3
  1,600 XP = Level 4
  10,000 XP = Level 10
  40,000 XP = Level 20
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│          SECURITY MEASURES                  │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Index.html)                      │
│  ├─ No sensitive data                       │
│  ├─ API calls only                          │
│  └─ CORS handled by backend                 │
│                                             │
│  Backend (server.js)                        │
│  ├─ Bot token in server-side only           │
│  ├─ Parameterized SQL queries               │
│  ├─ Input validation                        │
│  └─ Error handling                          │
│                                             │
│  Database (MySQL)                           │
│  ├─ Credentials in .env (gitignored)        │
│  ├─ Connection pooling                      │
│  ├─ Foreign key constraints                 │
│  └─ Indexed queries for performance         │
│                                             │
│  Discord Bot (bot.js)                       │
│  ├─ Required intents only                   │
│  ├─ Event validation                        │
│  └─ Error logging                           │
│                                             │
└─────────────────────────────────────────────┘
```

## File Structure Tree

```
RITUAL PROJECT/
│
├── Index.html                 # Frontend UI
│   ├── Search members
│   ├── View leaderboard
│   ├── Display stats
│   └── Activity feed
│
├── server.js                  # Backend API
│   ├── Express server
│   ├── API routes
│   ├── Discord API calls
│   └── Database queries
│
├── bot.js                     # Discord Bot
│   ├── Event listeners
│   ├── Message tracking
│   ├── XP calculation
│   └── Database updates
│
├── database/
│   ├── schema.sql            # DB structure
│   └── db.js                 # DB functions
│
├── package.json              # Dependencies
├── .env                      # Config (gitignored)
├── .gitignore               # Git excludes
│
└── Documentation/
    ├── README.md
    ├── QUICKSTART.md
    ├── MYSQL_SETUP.md
    ├── MYSQL_INTEGRATION.md
    └── MYSQL_COMPLETE.md
```

## Technology Stack

```
┌────────────────┐
│   Frontend     │
├────────────────┤
│ • HTML5        │
│ • CSS3         │
│ • JavaScript   │
│ • Fetch API    │
└────────────────┘

┌────────────────┐
│   Backend      │
├────────────────┤
│ • Node.js      │
│ • Express.js   │
│ • Axios        │
│ • CORS         │
└────────────────┘

┌────────────────┐
│   Database     │
├────────────────┤
│ • MySQL 8.0+   │
│ • mysql2       │
└────────────────┘

┌────────────────┐
│   Discord      │
├────────────────┤
│ • Discord.js   │
│ • Discord API  │
└────────────────┘
```

## Deployment Architecture

```
Development (Current):
┌──────────────────────────────────────┐
│         localhost:3000               │
│  ┌────────────┬──────────────────┐   │
│  │ Frontend   │  Backend API     │   │
│  │ (static)   │  (Express)       │   │
│  └────────────┴──────────────────┘   │
│         │              │              │
│         └──────┬───────┘              │
│                │                      │
│         ┌──────▼────────┐             │
│         │  MySQL DB     │             │
│         └───────────────┘             │
│                                       │
│  Discord Bot (separate process)       │
└──────────────────────────────────────┘

Production (Future):
┌────────────────────────────────────────┐
│  Vercel / Netlify (Frontend)           │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Heroku / Railway (Backend + Bot)      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  AWS RDS / PlanetScale (MySQL)         │
└────────────────────────────────────────┘
```

---

This architecture provides:
✅ Scalability
✅ Real-time tracking
✅ Persistent storage
✅ RESTful API
✅ Security
✅ Performance

# MySQL Database Setup Guide

## Prerequisites
- MySQL Server 8.0 or higher
- MySQL Workbench (optional, for GUI management)

## Installation

### Windows
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and select "Server only" or "Full" installation
3. Choose "Development Computer" setup type
4. Set a root password (remember this!)
5. Complete the installation

### Using XAMPP (Easier for beginners)
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start MySQL service
5. Default credentials: username=root, password=(empty)

## Database Setup

### Method 1: Using MySQL Command Line

1. Open Command Prompt or PowerShell
2. Connect to MySQL:
```bash
mysql -u root -p
```
3. Enter your MySQL password
4. Create the database and tables:
```bash
source C:/Users/user/Desktop/RITUAL PROJECT/database/schema.sql
```

### Method 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local server
3. Open the schema.sql file: `File > Open SQL Script`
4. Navigate to: `C:/Users/user/Desktop/RITUAL PROJECT/database/schema.sql`
5. Click the Execute button (⚡ lightning icon)

### Method 3: Using phpMyAdmin (if using XAMPP)

1. Open http://localhost/phpmyadmin in your browser
2. Click "New" to create a database
3. Name it `ritual_stats`
4. Click on the database
5. Go to "SQL" tab
6. Copy and paste the contents of `database/schema.sql`
7. Click "Go"

## Configuration

### Step 1: Update Environment Variables

1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ritual_stats
```

### Step 2: Test Connection

The server will automatically test the database connection when you start it:
```powershell
npm start
```

Look for this message:
```
✅ Database connected successfully
```

## Database Tables Overview

- **members** - Stores Discord member information
- **member_stats** - Tracks activity metrics (messages, XP, levels)
- **messages** - Logs message history
- **roles** - Stores role information
- **member_roles** - Links members to their roles
- **daily_stats** - Daily server statistics
- **leaderboard_cache** - Fast leaderboard queries
- **activity_logs** - Recent activity feed
- **server_stats** - Server snapshots over time

## How Data is Tracked

### Automatic Tracking
The bot will automatically track:
- Member joins and leaves
- Messages sent (count only, not content for privacy)
- Role assignments
- Activity timestamps

### XP System
- 10 XP per message
- Level up formula: Level = √(Total XP / 100)
- Leaderboard ranked by total XP

## Manual Data Entry (For Testing)

If you want to populate the database with test data:

```sql
-- Add a test member
INSERT INTO members (id, username, discriminator, display_name, joined_at)
VALUES ('123456789012345678', 'TestUser', '0001', 'Test User', NOW());

-- Add test stats
INSERT INTO member_stats (member_id, message_count, total_xp, level)
VALUES ('123456789012345678', 100, 1000, 10);

-- Log test activity
INSERT INTO activity_logs (activity_type, member_id, description)
VALUES ('level_up', '123456789012345678', 'TestUser reached level 10!');
```

## Troubleshooting

### Error: "Access denied for user"
- Check your MySQL username and password in `.env`
- Make sure MySQL server is running

### Error: "Database connection failed"
- Verify MySQL is running (XAMPP Control Panel or Services)
- Check if port 3306 is not blocked
- Try connecting with MySQL Workbench to test credentials

### Error: "Table doesn't exist"
- Run the schema.sql file to create tables
- Make sure you're connected to the correct database

### Can't connect to MySQL on Windows
- Check Windows Services for MySQL
- Make sure MySQL service is started
- Check firewall settings

## Maintenance

### Backup Database
```bash
mysqldump -u root -p ritual_stats > backup.sql
```

### Restore Database
```bash
mysql -u root -p ritual_stats < backup.sql
```

### Clear Old Data
```sql
-- Delete messages older than 90 days
DELETE FROM messages WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Clean up old activity logs
DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## Next Steps

After setting up MySQL:
1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. The bot will automatically populate data as members interact in Discord
4. View leaderboard: http://localhost:3000/api/guild/1210468736205852672/leaderboard
5. Check activities: http://localhost:3000/api/guild/1210468736205852672/activities

## Need Help?

- MySQL Documentation: https://dev.mysql.com/doc/
- XAMPP Forum: https://community.apachefriends.org/
- MySQL Workbench Guide: https://dev.mysql.com/doc/workbench/en/

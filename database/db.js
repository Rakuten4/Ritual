const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ritual_stats',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database utility functions
class Database {
    // Test connection
    static async testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Database connected successfully');
            connection.release();
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    // Insert or update member
    static async upsertMember(memberData) {
        const query = `
            INSERT INTO members (id, username, discriminator, display_name, avatar_url, joined_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                discriminator = VALUES(discriminator),
                display_name = VALUES(display_name),
                avatar_url = VALUES(avatar_url),
                last_seen = CURRENT_TIMESTAMP
        `;
        
        const values = [
            memberData.id,
            memberData.username,
            memberData.discriminator,
            memberData.displayName,
            memberData.avatarUrl,
            memberData.joinedAt
        ];
        
        const [result] = await pool.execute(query, values);
        return result;
    }

    // Get member by ID
    static async getMemberById(memberId) {
        const query = `
            SELECT m.*, ms.message_count, ms.voice_minutes, ms.total_xp, ms.level
            FROM members m
            LEFT JOIN member_stats ms ON m.id = ms.member_id
            WHERE m.id = ?
        `;
        
        const [rows] = await pool.execute(query, [memberId]);
        return rows[0] || null;
    }

    // Search member by username
    static async searchMemberByUsername(username) {
        const query = `
            SELECT m.*, ms.message_count, ms.voice_minutes, ms.total_xp, ms.level
            FROM members m
            LEFT JOIN member_stats ms ON m.id = ms.member_id
            WHERE m.username LIKE ? OR CONCAT(m.username, '#', m.discriminator) = ?
            LIMIT 1
        `;
        
        const [rows] = await pool.execute(query, [`%${username}%`, username]);
        return rows[0] || null;
    }

    // Update member stats
    static async updateMemberStats(memberId, stats) {
        const query = `
            INSERT INTO member_stats (member_id, message_count, voice_minutes, total_xp, level)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                message_count = message_count + VALUES(message_count),
                voice_minutes = voice_minutes + VALUES(voice_minutes),
                total_xp = total_xp + VALUES(total_xp),
                level = VALUES(level),
                updated_at = CURRENT_TIMESTAMP
        `;
        
        const values = [
            memberId,
            stats.messageCount || 0,
            stats.voiceMinutes || 0,
            stats.totalXp || 0,
            stats.level || 1
        ];
        
        const [result] = await pool.execute(query, values);
        return result;
    }

    // Log message
    static async logMessage(messageData) {
        const query = `
            INSERT INTO messages (id, member_id, channel_id, content, created_at, has_attachment)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            messageData.id,
            messageData.memberId,
            messageData.channelId,
            messageData.content,
            messageData.createdAt,
            messageData.hasAttachment || false
        ];
        
        const [result] = await pool.execute(query, values);
        
        // Update member stats
        await this.updateMemberStats(messageData.memberId, {
            messageCount: 1,
            totalXp: 10 // 10 XP per message
        });
        
        return result;
    }

    // Get leaderboard
    static async getLeaderboard(limit = 10) {
        const query = `
            SELECT m.id, m.username, m.discriminator, m.display_name, m.avatar_url,
                   ms.message_count, ms.voice_minutes, ms.total_xp, ms.level,
                   RANK() OVER (ORDER BY ms.total_xp DESC) as rank_position
            FROM members m
            INNER JOIN member_stats ms ON m.id = ms.member_id
            ORDER BY ms.total_xp DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [limit]);
        return rows;
    }

    // Get member rank
    static async getMemberRank(memberId) {
        const query = `
            SELECT rank_position FROM (
                SELECT member_id, RANK() OVER (ORDER BY total_xp DESC) as rank_position
                FROM member_stats
            ) as rankings
            WHERE member_id = ?
        `;
        
        const [rows] = await pool.execute(query, [memberId]);
        return rows[0]?.rank_position || null;
    }

    // Update daily stats
    static async updateDailyStats(date, stats) {
        const query = `
            INSERT INTO daily_stats (date, total_members, active_members, total_messages, new_members)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                total_members = VALUES(total_members),
                active_members = VALUES(active_members),
                total_messages = VALUES(total_messages),
                new_members = VALUES(new_members)
        `;
        
        const values = [
            date,
            stats.totalMembers,
            stats.activeMembers,
            stats.totalMessages,
            stats.newMembers
        ];
        
        const [result] = await pool.execute(query, values);
        return result;
    }

    // Log activity
    static async logActivity(activityType, memberId, description, metadata = null) {
        const query = `
            INSERT INTO activity_logs (activity_type, member_id, description, metadata)
            VALUES (?, ?, ?, ?)
        `;
        
        const values = [
            activityType,
            memberId,
            description,
            metadata ? JSON.stringify(metadata) : null
        ];
        
        const [result] = await pool.execute(query, values);
        return result;
    }

    // Get recent activities
    static async getRecentActivities(limit = 10) {
        const query = `
            SELECT al.*, m.username, m.discriminator, m.display_name
            FROM activity_logs al
            LEFT JOIN members m ON al.member_id = m.id
            ORDER BY al.created_at DESC
            LIMIT ?
        `;
        
        const [rows] = await pool.execute(query, [limit]);
        return rows;
    }

    // Get server stats summary
    static async getServerStatsSummary() {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM members) as total_members,
                (SELECT COUNT(*) FROM members WHERE DATE(last_seen) = CURDATE()) as active_today,
                (SELECT SUM(message_count) FROM member_stats) as total_messages,
                (SELECT COUNT(DISTINCT member_id) FROM member_stats WHERE message_count > 0) as active_contributors
        `;
        
        const [rows] = await pool.execute(query);
        return rows[0];
    }

    // Upsert role
    static async upsertRole(roleData) {
        const query = `
            INSERT INTO roles (id, name, color, position)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                color = VALUES(color),
                position = VALUES(position)
        `;
        
        const values = [
            roleData.id,
            roleData.name,
            roleData.color,
            roleData.position
        ];
        
        const [result] = await pool.execute(query, values);
        return result;
    }

    // Update member roles
    static async updateMemberRoles(memberId, roleIds) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Delete existing roles
            await connection.execute('DELETE FROM member_roles WHERE member_id = ?', [memberId]);
            
            // Insert new roles
            if (roleIds.length > 0) {
                const values = roleIds.map(roleId => [memberId, roleId]);
                await connection.query(
                    'INSERT INTO member_roles (member_id, role_id) VALUES ?',
                    [values]
                );
            }
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get roles by member
    static async getMemberRoles(memberId) {
        const query = `
            SELECT r.*
            FROM roles r
            INNER JOIN member_roles mr ON r.id = mr.role_id
            WHERE mr.member_id = ?
            ORDER BY r.position DESC
        `;
        
        const [rows] = await pool.execute(query, [memberId]);
        return rows;
    }
}

module.exports = Database;

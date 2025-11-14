-- Ritual Stats Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS ritual_stats;
USE ritual_stats;

-- Members table - stores basic member information
CREATE TABLE IF NOT EXISTS members (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    discriminator VARCHAR(10) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    joined_at DATETIME NOT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_last_seen (last_seen)
);

-- Member statistics table - tracks activity metrics
CREATE TABLE IF NOT EXISTS member_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    message_count INT DEFAULT 0,
    voice_minutes INT DEFAULT 0,
    reactions_given INT DEFAULT 0,
    reactions_received INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    level INT DEFAULT 1,
    last_message_at DATETIME,
    last_voice_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (member_id),
    INDEX idx_total_xp (total_xp),
    INDEX idx_message_count (message_count)
);

-- Messages table - stores message history
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    channel_id BIGINT NOT NULL,
    content TEXT,
    created_at DATETIME NOT NULL,
    edited_at DATETIME,
    deleted_at DATETIME,
    has_attachment BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_member_id (member_id),
    INDEX idx_channel_id (channel_id),
    INDEX idx_created_at (created_at)
);

-- Roles table - stores role information
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color INT,
    position INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_position (position)
);

-- Member roles junction table
CREATE TABLE IF NOT EXISTS member_roles (
    member_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (member_id, role_id),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Daily statistics - for tracking activity over time
CREATE TABLE IF NOT EXISTS daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    total_members INT DEFAULT 0,
    active_members INT DEFAULT 0,
    total_messages INT DEFAULT 0,
    new_members INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- Leaderboard cache - for faster leaderboard queries
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    rank_position INT NOT NULL,
    total_xp INT NOT NULL,
    message_count INT NOT NULL,
    voice_minutes INT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (member_id),
    INDEX idx_rank (rank_position)
);

-- Activity logs - for recent activity feed
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_type ENUM('member_join', 'member_leave', 'level_up', 'role_assigned', 'milestone') NOT NULL,
    member_id BIGINT,
    description TEXT NOT NULL,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at),
    INDEX idx_activity_type (activity_type)
);

-- Server stats snapshot
CREATE TABLE IF NOT EXISTS server_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_members INT NOT NULL,
    online_members INT NOT NULL,
    total_messages BIGINT NOT NULL,
    total_channels INT NOT NULL,
    snapshot_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_snapshot_at (snapshot_at)
);

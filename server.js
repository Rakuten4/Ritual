const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuration
const BOT_TOKEN = 'MTQzODY1OTIyNDQxNzczNDc3OQ.GEY_8l.7KTlhErFJqsVZasDZDngNhHcKCkkGNHKr39r-Y';
const GUILD_ID = '1210468736205852672';
const BOT_ID = '1438659224417734779';
const DISCORD_API = 'https://discord.com/api/v10';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper function to make Discord API requests
async function discordRequest(endpoint) {
    try {
        const response = await axios.get(`${DISCORD_API}${endpoint}`, {
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Discord API Error:', error.response?.data || error.message);
        throw error;
    }
}

// API Routes

// Get guild/server statistics
app.get('/api/guild/:guildId/stats', async (req, res) => {
    try {
        const { guildId } = req.params;
        
        // Fetch guild info with counts
        const guild = await discordRequest(`/guilds/${guildId}?with_counts=true`);
        
        // Get channels for additional stats
        const channels = await discordRequest(`/guilds/${guildId}/channels`);
        
        const stats = {
            name: guild.name,
            memberCount: guild.approximate_member_count || 0,
            onlineCount: guild.approximate_presence_count || 0,
            channelCount: channels.length,
            icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
            description: guild.description || 'No description'
        };
        
        res.json(stats);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch guild stats',
            message: error.message 
        });
    }
});

// Get member information
app.get('/api/guild/:guildId/member/:userId', async (req, res) => {
    try {
        const { guildId, userId } = req.params;
        
        // Try to fetch member by ID or search by username
        let member;
        
        try {
            // Try as user ID first
            member = await discordRequest(`/guilds/${guildId}/members/${userId}`);
        } catch (error) {
            // If not found by ID, search members
            const members = await discordRequest(`/guilds/${guildId}/members?limit=1000`);
            member = members.find(m => 
                m.user.username.toLowerCase() === userId.toLowerCase() ||
                `${m.user.username}#${m.user.discriminator}` === userId
            );
            
            if (!member) {
                return res.status(404).json({ error: 'Member not found' });
            }
        }
        
        const memberInfo = {
            id: member.user.id,
            username: member.user.username,
            discriminator: member.user.discriminator,
            displayName: member.nick || member.user.username,
            avatar: member.user.avatar ? 
                `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : null,
            joinedAt: member.joined_at,
            roles: member.roles,
            premiumSince: member.premium_since
        };
        
        res.json(memberInfo);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch member info',
            message: error.message 
        });
    }
});

// Get role holders
app.get('/api/guild/:guildId/roles', async (req, res) => {
    try {
        const { guildId } = req.params;
        
        const roles = await discordRequest(`/guilds/${guildId}/roles`);
        const members = await discordRequest(`/guilds/${guildId}/members?limit=1000`);
        
        // Count members per role
        const roleStats = roles.map(role => {
            const memberCount = members.filter(m => m.roles.includes(role.id)).length;
            return {
                id: role.id,
                name: role.name,
                color: role.color,
                position: role.position,
                memberCount: memberCount,
                members: members
                    .filter(m => m.roles.includes(role.id))
                    .map(m => ({
                        id: m.user.id,
                        username: m.user.username,
                        discriminator: m.user.discriminator,
                        displayName: m.nick || m.user.username
                    }))
            };
        }).sort((a, b) => b.position - a.position);
        
        res.json(roleStats);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch roles',
            message: error.message 
        });
    }
});

// Get leaderboard (top active members)
app.get('/api/guild/:guildId/leaderboard', async (req, res) => {
    try {
        const { guildId } = req.params;
        
        // Fetch all members
        const members = await discordRequest(`/guilds/${guildId}/members?limit=1000`);
        
        // Note: Discord API doesn't provide message counts or activity stats directly
        // You would need to track this yourself using a bot that logs messages
        // For now, return members sorted by join date as a placeholder
        
        const leaderboard = members
            .map(m => ({
                id: m.user.id,
                username: m.user.username,
                discriminator: m.user.discriminator,
                displayName: m.nick || m.user.username,
                avatar: m.user.avatar ? 
                    `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png` : null,
                joinedAt: m.joined_at,
                roles: m.roles
            }))
            .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
            .slice(0, 10);
        
        res.json(leaderboard);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch leaderboard',
            message: error.message 
        });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        botId: BOT_ID,
        guildId: GUILD_ID,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Ritual Stats Server running on http://localhost:${PORT}`);
    console.log(`📊 Guild ID: ${GUILD_ID}`);
    console.log(`🤖 Bot ID: ${BOT_ID}`);
    console.log(`\n⚠️  IMPORTANT: Replace 'YOUR_BOT_TOKEN_HERE' in server.js with your actual bot token\n`);
});

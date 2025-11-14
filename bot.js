// Example Discord Bot with Message Tracking
// This file shows how to track messages and update the database

const { Client, GatewayIntentBits } = require('discord.js');
const Database = require('./database/db');

const BOT_TOKEN = 'MTQzODY1OTIyNDQxNzczNDc3OQ.G_yYJc.vMHWTs71S2BJ61rssQeY0V01hDVsX1amt4TnWs';
const GUILD_ID = '1210468736205852672';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

// Bot ready event
client.on('ready', async () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    
    // Test database connection
    await Database.testConnection();
    
    // Sync all members to database
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        console.log(`📊 Syncing members for ${guild.name}...`);
        const members = await guild.members.fetch();
        
        for (const [id, member] of members) {
            if (member.user.bot) continue;
            
            await Database.upsertMember({
                id: member.id,
                username: member.user.username,
                discriminator: member.user.discriminator,
                displayName: member.displayName,
                avatarUrl: member.user.displayAvatarURL(),
                joinedAt: member.joinedAt
            });
            
            // Update roles
            await Database.updateMemberRoles(member.id, member.roles.cache.map(r => r.id));
        }
        
        console.log(`✅ Synced ${members.size} members`);
    }
});

// Message tracking
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Only track messages in the configured guild
    if (message.guild?.id !== GUILD_ID) return;
    
    try {
        // Ensure member exists in database
        await Database.upsertMember({
            id: message.author.id,
            username: message.author.username,
            discriminator: message.author.discriminator,
            displayName: message.member?.displayName || message.author.username,
            avatarUrl: message.author.displayAvatarURL(),
            joinedAt: message.member?.joinedAt || new Date()
        });
        
        // Log the message (awards XP automatically)
        await Database.logMessage({
            id: message.id,
            memberId: message.author.id,
            channelId: message.channel.id,
            content: message.content.substring(0, 500), // Store first 500 chars only
            createdAt: message.createdAt,
            hasAttachment: message.attachments.size > 0
        });
        
        // Check for level up
        const member = await Database.getMemberById(message.author.id);
        if (member) {
            const newLevel = Math.floor(Math.sqrt(member.total_xp / 100));
            
            if (newLevel > member.level) {
                // Update level
                await Database.updateMemberStats(message.author.id, { 
                    messageCount: 0, // Don't add messages again
                    totalXp: 0, // Don't add XP again
                    level: newLevel 
                });
                
                // Log level up activity
                await Database.logActivity(
                    'level_up',
                    message.author.id,
                    `${message.author.username} reached level ${newLevel}!`,
                    { level: newLevel, xp: member.total_xp }
                );
                
                // Optional: Send congrats message
                message.reply(`🎉 Congratulations! You've reached level **${newLevel}**!`);
            }
        }
    } catch (error) {
        console.error('Error tracking message:', error);
    }
});

// Member join event
client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== GUILD_ID) return;
    
    try {
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
            `${member.user.username} joined the Ritual community`,
            { memberCount: member.guild.memberCount }
        );
        
        console.log(`👋 New member: ${member.user.tag}`);
    } catch (error) {
        console.error('Error tracking member join:', error);
    }
});

// Member leave event
client.on('guildMemberRemove', async (member) => {
    if (member.guild.id !== GUILD_ID) return;
    
    try {
        await Database.logActivity(
            'member_leave',
            member.id,
            `${member.user.username} left the server`,
            { memberCount: member.guild.memberCount }
        );
        
        console.log(`👋 Member left: ${member.user.tag}`);
    } catch (error) {
        console.error('Error tracking member leave:', error);
    }
});

// Role update event
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.guild.id !== GUILD_ID) return;
    
    try {
        // Check if roles changed
        const oldRoles = oldMember.roles.cache.map(r => r.id);
        const newRoles = newMember.roles.cache.map(r => r.id);
        
        if (JSON.stringify(oldRoles.sort()) !== JSON.stringify(newRoles.sort())) {
            // Update roles in database
            await Database.updateMemberRoles(newMember.id, newRoles);
            
            // Find added roles
            const addedRoles = newRoles.filter(r => !oldRoles.includes(r));
            if (addedRoles.length > 0) {
                const roleNames = addedRoles
                    .map(id => newMember.guild.roles.cache.get(id)?.name)
                    .filter(Boolean);
                
                await Database.logActivity(
                    'role_assigned',
                    newMember.id,
                    `${newMember.user.username} received role(s): ${roleNames.join(', ')}`,
                    { roles: roleNames }
                );
            }
        }
    } catch (error) {
        console.error('Error tracking role update:', error);
    }
});

// Daily stats update (runs every hour)
setInterval(async () => {
    try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return;
        
        const today = new Date().toISOString().split('T')[0];
        const members = await guild.members.fetch();
        const onlineMembers = members.filter(m => 
            m.presence?.status === 'online' || m.presence?.status === 'idle'
        );
        
        const dbStats = await Database.getServerStatsSummary();
        
        await Database.updateDailyStats(today, {
            totalMembers: guild.memberCount,
            activeMembers: onlineMembers.size,
            totalMessages: dbStats.total_messages || 0,
            newMembers: 0 // Calculate from member_join activities
        });
        
        console.log('📊 Updated daily stats');
    } catch (error) {
        console.error('Error updating daily stats:', error);
    }
}, 60 * 60 * 1000); // Every hour

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login
client.login(BOT_TOKEN);

console.log('🤖 Starting Discord bot with message tracking...');

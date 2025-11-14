// Test Discord API connection
const axios = require('axios');

const BOT_TOKEN = 'MTQzODY1OTIyNDQxNzczNDc3OQ.G_yYJc.vMHWTs71S2BJ61rssQeY0V01hDVsX1amt4TnWs';
const GUILD_ID = '1210468736205852672';

async function testAPI() {
    try {
        console.log('Testing Discord API connection...\n');
        
        // Test 1: Get bot user info
        console.log('Test 1: Getting bot user info...');
        const botUser = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
        });
        console.log('✅ Bot User:', botUser.data.username + '#' + botUser.data.discriminator);
        console.log('   Bot ID:', botUser.data.id);
        
        // Test 2: Get guilds the bot is in
        console.log('\nTest 2: Getting guilds bot is in...');
        const guilds = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
            headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
        });
        console.log('✅ Bot is in', guilds.data.length, 'guild(s)');
        guilds.data.forEach(g => {
            console.log('   -', g.name, '(ID:', g.id + ')');
        });
        
        // Test 3: Check if bot is in the target guild
        console.log('\nTest 3: Checking if bot is in target guild...');
        const inTargetGuild = guilds.data.find(g => g.id === GUILD_ID);
        if (inTargetGuild) {
            console.log('✅ Bot is in target guild:', inTargetGuild.name);
        } else {
            console.log('❌ Bot is NOT in target guild ID:', GUILD_ID);
            console.log('   You need to invite the bot to this server!');
        }
        
        // Test 4: Try to get guild info
        if (inTargetGuild) {
            console.log('\nTest 4: Getting guild details...');
            const guild = await axios.get(`https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`, {
                headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
            });
            console.log('✅ Guild Name:', guild.data.name);
            console.log('   Members:', guild.data.approximate_member_count);
            console.log('   Online:', guild.data.approximate_presence_count);
        }
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error('   Token is invalid or expired!');
        } else if (error.response?.status === 403) {
            console.error('   Bot does not have permission!');
        } else if (error.response?.status === 404) {
            console.error('   Bot is not in the guild!');
        }
    }
}

testAPI();

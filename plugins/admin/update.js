const simpleGit = require('simple-git');
const git = simpleGit();

module.exports = {
    name: 'update',
    description: 'Update Fluffy System',
    async execute(client, message) {
        if (message.author.id !== client.config.OWNER_ID) return;
        
        await message.reply("Checking for updates...");
        await git.pull();
        await message.reply("Update Complete! Restarting...");
        process.exit(0);
    }
};
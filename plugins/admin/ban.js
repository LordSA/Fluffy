module.exports = {
    commands: [
        {
            name: 'ban',
            description: 'Ban a user',
            async execute(client, message, args) {
                if (!message.member.permissions.has('BanMembers')) return message.reply("You are weak.");
                const user = message.mentions.users.first();
                if (user) {
                    message.guild.members.ban(user);
                    message.reply(`${user.tag} has been eliminated.`);
                }
            }
        }
    ]
};
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = async (interaction, pages, time = 60000) => {
    if (!pages || pages.length === 0) return;
    if (pages.length === 1) return interaction.reply({ embeds: [pages[0]] });

    let index = 0;

    const getButtons = (pageIdx) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIdx === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIdx === pages.length - 1)
            );
        return [row];
    };

    const msg = await interaction.reply({ 
        embeds: [pages[index]], 
        components: getButtons(index), 
        fetchReply: true 
    });

    const collector = msg.createMessageComponentCollector({ 
        componentType: ComponentType.Button, 
        time 
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            return i.reply({ content: "❌ You cannot control this pagination!", ephemeral: true });
        }

        if (i.customId === 'prev') index--;
        else if (i.customId === 'next') index++;

        await i.update({ embeds: [pages[index]], components: getButtons(index) });
    });

    collector.on('end', () => {
        const disabledRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('◀ Previous').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('next').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );
        msg.edit({ components: [disabledRow] }).catch(() => {});
    });
};
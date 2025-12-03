const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath);
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
        client.logger.info(`Event Loaded: ${eventName}`);
    }
};
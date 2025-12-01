const ErenClient = require('./core/client');
const client = new ErenClient();
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

client.start();
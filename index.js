const sodium = require('libsodium-wrappers');
(async () => {
    await sodium.ready;
    const FluffyClient = require('./core/client');
    const client = new FluffyClient();

    client.start();

    process.on('unhandledRejection', (err) => console.error(err));
})();
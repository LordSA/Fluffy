module.exports = (client, d) => {
    if (client.shoukaku) {
        client.shoukaku.updateVoiceState(d);
    }
};
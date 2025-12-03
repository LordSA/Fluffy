module.exports = (client, d) => {
    // Send raw events to Shoukaku
    if (client.shoukaku) {
        client.shoukaku.updateVoiceState(d);
    }
};
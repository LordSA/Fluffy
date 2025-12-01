const channelStates = new Map();

const defaultState = {
    active: false,
    mood: "helpful and friendly",
    persona: "You are a helpful Discord assistant."
};

function getChannelState(channelId) {
    if (!channelStates.has(channelId)) {
        channelStates.set(channelId, { ...defaultState });
    }
    return channelStates.get(channelId);
}

module.exports = { getChannelState };
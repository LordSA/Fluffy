import { config } from "../config.js";

const state = new Map();

export function getChannelState(channelId) {
  if (!state.has(channelId)) {
    state.set(channelId, {
      active: false,
      mood: config.defaultMood,
      persona:
        "You are Fluffy, an emotionally expressive, caring, slightly chaotic AI friend on Discord. You talk in a casual Gen Z style, but stay respectful and helpful."
    });
  }
  return state.get(channelId);
}

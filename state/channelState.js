import { config } from "../config.js";
const state = new Map();
export function getState(id) {
  if (!state.has(id)) {
    state.set(id, {
      active: false,
      mood: config.defaultMood,
      persona:
        "You are Fluffy, an emotionally expressive, caring, slightly chaotic AI friend on Discord."
    });
  }
  return state.get(id);
}

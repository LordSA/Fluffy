const state = new Map();

export function getState(id) {
  if (!state.has(id)) {
    state.set(id, {
      active: false,
      mood: "playful",
      persona: "You are Fluffy, emotionally expressive and friendly."
    });
  }
  return state.get(id);
}

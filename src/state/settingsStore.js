import { useSyncExternalStore } from "react";
import { themes, fonts } from "../utils/themes";

const KEY = "smessage:settings";
const defaults = { theme: "amethyst", fontSize: 16, fontFamily: fonts[0] };

let state = (() => {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { ...defaults }; }
})();

const listeners = new Set();
function set(patch) {
  state = { ...state, ...patch };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach(l => l());
}
export const settings = {
  use() { return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => state); },
  set, themes, fonts
};

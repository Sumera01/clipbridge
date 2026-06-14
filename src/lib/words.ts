export const ADJECTIVES = [
  "amber", "arctic", "bold", "bright", "calm", "clean", "cold", "crisp",
  "dark", "deep", "electric", "fast", "ghost", "golden", "green", "hollow",
  "iron", "jade", "keen", "lunar", "muted", "night", "neon", "nova",
  "oak", "old", "pale", "quick", "raw", "red", "rock", "rust",
  "sharp", "silver", "silent", "slate", "steel", "storm", "swift", "teal",
  "urban", "vast", "wild", "winter", "zero"
];

export const NOUNS = [
  "anvil", "arch", "arrow", "axe", "beacon", "beam", "blade", "bolt",
  "brick", "bridge", "byte", "cable", "chain", "chip", "circuit", "cliff",
  "code", "coil", "core", "cube", "data", "deck", "delta", "disk",
  "door", "draft", "drop", "drum", "echo", "edge", "field", "file",
  "flame", "flux", "fog", "fork", "gate", "gear", "grid", "hash",
  "hub", "key", "lane", "link", "loop", "mesh", "node", "null",
  "orbit", "path", "peak", "pipe", "pixel", "port", "pulse", "rack",
  "rail", "relay", "ring", "root", "scope", "seed", "shell", "signal",
  "slot", "socket", "stack", "stone", "sync", "tab", "thread", "tile",
  "token", "trace", "trunk", "vault", "void", "wave", "wire", "zero"
];

export function generateRoomCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}-${noun}-${num}`;
}

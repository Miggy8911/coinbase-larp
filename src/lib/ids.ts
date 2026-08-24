export function hexTx(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function coinbaseRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return `CB${[...bytes].map((b) => alphabet[b % alphabet.length]).join("")}`;
}

export function uid(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function nowLabel(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function parseMoney(raw: string): number | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\b(usd|us dollars?|dollars?)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;

  const pairs: [RegExp, number][] = [
    [/^(.*)\s*(trillion|tn)$/, 1e12],
    [/^(.*)\s*(billion|bil)$/, 1e9],
    [/^(.*)\s*(million|mil)$/, 1e6],
    [/^(.*)\s*(thousand|grand)$/, 1e3],
    [/^(.+)t$/, 1e12],
    [/^(.+)b$/, 1e9],
    [/^(.+)m$/, 1e6],
    [/^(.+)k$/, 1e3],
  ];
  for (const [re, mul] of pairs) {
    const m = s.match(re);
    if (!m) continue;
    const n = Number(m[1].trim());
    if (Number.isFinite(n) && n >= 0) return Math.min(n * mul, 1e15);
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, 1e15);
}

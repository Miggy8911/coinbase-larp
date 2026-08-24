export function CoinbaseMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="12" fill="#0052FF" />
      <circle cx="12" cy="12" r="5.55" fill="none" stroke="#fff" strokeWidth="3.55" strokeDasharray="27.4 7.45" transform="rotate(38 12 12)" />
    </svg>
  );
}

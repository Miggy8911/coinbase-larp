export function CoinbaseMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="12" fill="#0052FF" />
      <path
        fill="#fff"
        d="M12.85 6.4v11.2c2.9-.28 5.05-2.05 5.05-5.6 0-3.55-2.15-5.32-5.05-5.6zM11.15 6.4C8.25 6.68 6.1 8.45 6.1 12c0 3.55 2.15 5.32 5.05 5.6V6.4z"
      />
    </svg>
  );
}

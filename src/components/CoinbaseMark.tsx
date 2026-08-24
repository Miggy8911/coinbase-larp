/** Official Coinbase LogoMark path from Coinbase Design System. */
export const COINBASE_MARK_PATH =
  "M12.0225 18C8.70131 18 6.01127 15.315 6.01127 12C6.01127 8.685 8.70131 6 12.0225 6C14.9981 6 17.4678 8.165 17.9436 11H24C23.489 4.84 18.3244 0 12.0225 0C5.3851 0 0 5.375 0 12C0 18.625 5.3851 24 12.0225 24C18.3244 24 23.489 19.16 24 13H17.9436C17.4678 15.835 14.9981 18 12.0225 18Z";

export function CoinbaseMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#0052FF" d={COINBASE_MARK_PATH} />
    </svg>
  );
}

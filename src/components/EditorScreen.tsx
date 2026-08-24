"use client";

import { useWallet } from "@/lib/wallet-context";

export function EditorScreen() {
  const { state, updateWallet, updateToken, addToken, removeToken, reset, setScreen } =
    useWallet();

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pt-4 pb-6">
      <h2 className="text-center text-[17px] font-semibold">Wallet editor</h2>
      <p className="mt-1 text-center text-[12px] text-[#8d8d8d]">
        Type LARP amounts. USD price and 24h % refresh from live feeds when the CoinGecko id is set.
      </p>

      <label className="mt-5 text-[12px] text-[#8d8d8d]">Wallet name</label>
      <input
        value={state.walletName}
        onChange={(e) => updateWallet({ walletName: e.target.value })}
        className="mt-1 rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm outline-none"
      />

      <label className="mt-3 text-[12px] text-[#8d8d8d]">Display address</label>
      <input
        value={state.address}
        onChange={(e) => updateWallet({ address: e.target.value })}
        className="mt-1 rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm outline-none"
      />

      <label className="mt-3 text-[12px] text-[#8d8d8d]">Cash (USD, Phantom skin)</label>
      <input
        value={String(state.cashUsd ?? 0)}
        onChange={(e) => updateWallet({ cashUsd: Number(e.target.value) || 0 })}
        className="mt-1 rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm outline-none"
      />

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[14px] font-semibold">Tokens</p>
        <button type="button" onClick={addToken} className="text-[13px] font-medium text-[#AB9FF2]">
          Add token
        </button>
      </div>

      <div className="mt-2 space-y-3">
        {state.tokens.map((t) => (
          <div key={t.id} className="rounded-2xl bg-[#2a2a2a] p-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Symbol" value={t.symbol} onChange={(v) => updateToken(t.id, { symbol: v.toUpperCase() })} />
              <Field label="Name" value={t.name} onChange={(v) => updateToken(t.id, { name: v })} />
              <Field
                label="Amount"
                value={String(t.amount)}
                onChange={(v) => updateToken(t.id, { amount: Number(v) || 0 })}
              />
              <Field
                label="USD price"
                value={String(t.priceUsd)}
                onChange={(v) => updateToken(t.id, { priceUsd: Number(v) || 0 })}
              />
              <Field
                label="24h %"
                value={String(t.change24h)}
                onChange={(v) => updateToken(t.id, { change24h: Number(v) || 0 })}
              />
              <Field label="Color" value={t.color} onChange={(v) => updateToken(t.id, { color: v })} />
            </div>
            <Field
              label="CoinGecko id (optional)"
              value={t.coingeckoId}
              onChange={(v) => updateToken(t.id, { coingeckoId: v })}
            />
            <button
              type="button"
              onClick={() => removeToken(t.id)}
              className="mt-2 text-[12px] text-[#ff5a6a]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all simulated balances?")) reset();
          }}
          className="h-11 flex-1 rounded-full bg-[#3a3a3a] text-sm font-semibold"
        >
          Reset demo
        </button>
        <button
          type="button"
          onClick={() => setScreen("home")}
          className="h-11 flex-1 rounded-full bg-[#AB9FF2] text-sm font-semibold text-[#1b1529]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="mt-2 block text-[11px] text-[#8d8d8d]">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-[#1c1c1c] px-3 py-2 text-[13px] text-white outline-none"
      />
    </label>
  );
}

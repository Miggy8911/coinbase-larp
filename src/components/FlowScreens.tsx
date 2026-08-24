"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { formatAmount, formatUsd } from "@/lib/utils";
import { TokenGlyph } from "./TokenGlyph";

export function SwapScreen() {
  const { state, simulateSwap, setScreen } = useWallet();
  const [fromId, setFromId] = useState(state.tokens[0]?.id ?? "");
  const [toId, setToId] = useState(state.tokens[1]?.id ?? state.tokens[0]?.id ?? "");
  const [amount, setAmount] = useState("10");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const from = state.tokens.find((t) => t.id === fromId);
  const to = state.tokens.find((t) => t.id === toId);
  const num = Number(amount) || 0;
  const quote = useMemo(() => {
    if (!from || !to || to.priceUsd <= 0) return 0;
    return (num * from.priceUsd) / to.priceUsd;
  }, [from, to, num]);

  async function run() {
    if (!from || !to || num <= 0) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    simulateSwap(from.id, to.id, num);
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <Success
        title="Swap complete"
        body="This was a local simulation. Nothing left your device."
        onDone={() => {
          setDone(false);
          setScreen("home");
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pt-4">
      <h2 className="text-center text-[17px] font-semibold">Swap</h2>
      <p className="mt-1 text-center text-[12px] text-[#8d8d8d]">Simulated quote · not on-chain</p>

      {state.tokens.length < 2 ? (
        <p className="mt-10 text-center text-sm text-[#8d8d8d]">
          Add at least two tokens in Edit to swap.
        </p>
      ) : (
        <>
          <div className="mt-6 rounded-3xl bg-[#2a2a2a] p-4">
            <p className="text-[12px] text-[#8d8d8d]">You pay</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full bg-transparent text-[28px] font-semibold outline-none"
              />
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="rounded-full bg-[#3a3a3a] px-3 py-2 text-sm outline-none"
              >
                {state.tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
            {from && (
              <p className="mt-1 text-[12px] text-[#8d8d8d]">
                Balance {formatAmount(from.amount)} · {formatUsd(num * from.priceUsd)}
              </p>
            )}
          </div>

          <div className="z-10 -my-3 flex justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a3a3a] bg-[#222] text-[#AB9FF2]">
              <ArrowDownUp size={16} />
            </span>
          </div>

          <div className="rounded-3xl bg-[#2a2a2a] p-4">
            <p className="text-[12px] text-[#8d8d8d]">You receive</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="w-full text-[28px] font-semibold">{formatAmount(quote)}</p>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="rounded-full bg-[#3a3a3a] px-3 py-2 text-sm outline-none"
              >
                {state.tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
            {to && (
              <div className="mt-2 flex items-center gap-2 text-[12px] text-[#8d8d8d]">
                <TokenGlyph symbol={to.symbol} color={to.color} size={18} />
                Est. {formatUsd(quote * to.priceUsd)}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={busy || num <= 0 || fromId === toId}
            onClick={run}
            className="mt-auto mb-4 h-12 rounded-full bg-[#AB9FF2] text-[15px] font-semibold text-[#1b1529] disabled:opacity-40"
          >
            {busy ? "Simulating…" : "Review swap"}
          </button>
        </>
      )}
    </div>
  );
}

export function SendScreen() {
  const { state, simulateSend, setScreen } = useWallet();
  const [tokenId, setTokenId] = useState(state.tokens[0]?.id ?? "");
  const [amount, setAmount] = useState("1");
  const [to, setTo] = useState("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const token = state.tokens.find((t) => t.id === tokenId);
  const num = Number(amount) || 0;

  async function run() {
    if (!token || num <= 0) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    simulateSend(token.id, num, to || "11111111111111111111111111111111");
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <Success
        title="Sent (simulated)"
        body="No transaction was broadcast. This only changed the numbers on this device."
        onDone={() => {
          setDone(false);
          setScreen("home");
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col px-4 pt-4">
      <h2 className="text-center text-[17px] font-semibold">Send</h2>
      <p className="mt-1 text-center text-[12px] text-[#8d8d8d]">Local only · nothing is broadcast</p>

      <label className="mt-6 text-[12px] text-[#8d8d8d]">To</label>
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="mt-1 rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm outline-none"
      />

      <label className="mt-4 text-[12px] text-[#8d8d8d]">Token</label>
      <select
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="mt-1 rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm outline-none"
      >
        {state.tokens.map((t) => (
          <option key={t.id} value={t.id}>
            {t.symbol} · {formatAmount(t.amount)}
          </option>
        ))}
      </select>

      <label className="mt-4 text-[12px] text-[#8d8d8d]">Amount</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="decimal"
        className="mt-1 rounded-2xl bg-[#2a2a2a] px-4 py-3 text-[22px] font-semibold outline-none"
      />
      {token && (
        <p className="mt-2 text-[12px] text-[#8d8d8d]">{formatUsd(num * token.priceUsd)}</p>
      )}

      <button
        type="button"
        disabled={busy || num <= 0 || !token}
        onClick={run}
        className="mt-auto mb-4 h-12 rounded-full bg-[#AB9FF2] text-[15px] font-semibold text-[#1b1529] disabled:opacity-40"
      >
        {busy ? "Simulating…" : "Send"}
      </button>
    </div>
  );
}

export function ReceiveScreen() {
  const { state, setScreen } = useWallet();
  return (
    <div className="flex h-full flex-col items-center px-6 pt-6">
      <h2 className="text-[17px] font-semibold">Receive</h2>
      <div className="mt-8 flex h-48 w-48 items-center justify-center rounded-3xl bg-white p-4">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#111 0 8px,transparent 8px 16px), repeating-linear-gradient(0deg,#111 0 8px,transparent 8px 16px)",
            backgroundSize: "100% 8px, 8px 100%",
            backgroundPosition: "center",
          }}
        />
      </div>
      <p className="mt-6 break-all text-center text-[13px] text-[#cfcfcf]">{state.address}</p>
      <p className="mt-3 text-center text-[12px] text-[#8d8d8d]">
        Decorative QR only. Do not send real assets here.
      </p>
      <button
        type="button"
        onClick={() => setScreen("home")}
        className="mt-auto mb-4 h-12 w-full rounded-full bg-[#2a2a2a] text-[15px] font-semibold"
      >
        Done
      </button>
    </div>
  );
}

function Success({
  title,
  body,
  onDone,
}: {
  title: string;
  body: string;
  onDone: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#AB9FF2] text-2xl text-[#1b1529]">
        ✓
      </div>
      <h2 className="mt-5 text-[22px] font-semibold">{title}</h2>
      <p className="mt-2 text-[14px] text-[#9b9b9b]">{body}</p>
      <button
        type="button"
        onClick={onDone}
        className="mt-8 h-12 w-full rounded-full bg-[#AB9FF2] text-[15px] font-semibold text-[#1b1529]"
      >
        Back to wallet
      </button>
    </div>
  );
}

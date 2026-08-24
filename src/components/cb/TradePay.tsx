"use client";

import { useState } from "react";
import { Note } from "../Note";
import { useApp } from "@/lib/app-context";
import { useHoldings } from "@/lib/quotes-store";
import { formatAmount, formatPrice } from "@/lib/utils";

export function TradeTab() {
  const { state, buyCrypto, sellCrypto, convert } = useApp();
  const { tokens } = useHoldings(state.tokens, state.cashUsd);
  const [mode, setMode] = useState<"buy" | "sell" | "convert">("buy");
  const [tokenId, setTokenId] = useState(tokens[0]?.id ?? "btc");
  const [toId, setToId] = useState(tokens[1]?.id ?? "eth");
  const [usd, setUsd] = useState("25000");
  const [qty, setQty] = useState("1");
  const token = tokens.find((t) => t.id === tokenId);
  const to = tokens.find((t) => t.id === toId);

  return (
    <div className="scroll flex h-full flex-col px-4 pt-4">
      <h1 className="text-[22px] font-semibold">Trade</h1>
      <div className="mt-3 flex rounded-full bg-[#1e2026] p-1 text-[13px] font-semibold">
        {(["buy", "sell", "convert"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`tap flex-1 rounded-full py-2 capitalize ${mode === m ? "bg-[#0052FF]" : ""}`}
          >
            {m}
          </button>
        ))}
      </div>

      <label className="mt-5 text-[12px] text-white/45">Asset</label>
      <select className="field" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {tokens.map((t) => (
          <option key={t.id} value={t.id}>
            {t.symbol} · {formatPrice(t.priceUsd)}
          </option>
        ))}
      </select>

      {mode === "buy" && (
        <>
          <label className="mt-3 text-[12px] text-white/45">Amount (USD)</label>
          <input className="field text-[22px] font-semibold tabular-nums" value={usd} onChange={(e) => setUsd(e.target.value)} />
          {token && token.priceUsd > 0 && (
            <p className="mt-2 text-[13px] text-white/45 tabular-nums">
              You receive ~{formatAmount(Number(usd) / token.priceUsd)} {token.symbol}
            </p>
          )}
          <Note className="mt-1 text-[12px] text-white/35">Pays from USD cash</Note>
          <button
            type="button"
            className="tap mt-auto mb-4 h-12 rounded-full bg-[#0052FF] text-[15px] font-semibold"
            onClick={() => buyCrypto(tokenId, Number(usd) || 0)}
          >
            Buy {token?.symbol}
          </button>
        </>
      )}

      {mode === "sell" && (
        <>
          <label className="mt-3 text-[12px] text-white/45">Amount ({token?.symbol})</label>
          <input className="field text-[22px] font-semibold tabular-nums" value={qty} onChange={(e) => setQty(e.target.value)} />
          {token && (
            <p className="mt-2 text-[13px] text-white/45 tabular-nums">
              Credit ~${((Number(qty) || 0) * token.priceUsd).toLocaleString()} to USD
            </p>
          )}
          <button
            type="button"
            className="tap mt-auto mb-4 h-12 rounded-full bg-[#0052FF] text-[15px] font-semibold"
            onClick={() => sellCrypto(tokenId, Number(qty) || 0)}
          >
            Sell {token?.symbol}
          </button>
        </>
      )}

      {mode === "convert" && (
        <>
          <label className="mt-3 text-[12px] text-white/45">From amount</label>
          <input className="field text-[22px] font-semibold tabular-nums" value={qty} onChange={(e) => setQty(e.target.value)} />
          <label className="mt-3 text-[12px] text-white/45">To</label>
          <select className="field" value={toId} onChange={(e) => setToId(e.target.value)}>
            {tokens.map((t) => (
              <option key={t.id} value={t.id}>
                {t.symbol}
              </option>
            ))}
          </select>
          {token && to && to.priceUsd > 0 && (
            <p className="mt-2 text-[13px] text-white/45 tabular-nums">
              ≈ {formatAmount(((Number(qty) || 0) * token.priceUsd) / to.priceUsd)} {to.symbol}
            </p>
          )}
          <button
            type="button"
            className="tap mt-auto mb-4 h-12 rounded-full bg-[#0052FF] text-[15px] font-semibold"
            onClick={() => convert(tokenId, toId, Number(qty) || 0)}
          >
            Convert
          </button>
        </>
      )}
    </div>
  );
}

export function PayTab() {
  const { state, setOverlay } = useApp();
  return (
    <div className="flex h-full flex-col">
      <h1 className="px-4 pt-4 text-[22px] font-semibold">Pay</h1>
      <Note className="px-4 text-[13px] text-white/45">Send or receive. Completes only on this device.</Note>
      <div className="mt-4 grid grid-cols-2 gap-2 px-4">
        <button
          type="button"
          onClick={() => setOverlay("send")}
          className="tap h-12 rounded-full bg-[#0052FF] text-[14px] font-semibold"
        >
          Send
        </button>
        <button
          type="button"
          onClick={() => setOverlay("receive")}
          className="tap h-12 rounded-full bg-[#1e2026] text-[14px] font-semibold"
        >
          Receive
        </button>
      </div>
      <p className="mt-6 px-4 text-[13px] font-semibold text-white/70">Recent</p>
      <ul className="scroll flex-1 px-4 pb-4">
        {state.activity.length === 0 && (
          <li className="py-8 text-center text-[13px] text-white/40">No activity yet</li>
        )}
        {state.activity.map((a) => (
          <li key={a.id} className="border-b border-white/5 py-3">
            <div className="flex justify-between text-[14px]">
              <span className="font-medium">{a.title}</span>
              <span className="tabular-nums">{a.amountLabel}</span>
            </div>
            <p className="mt-1 text-[12px] text-white/45">
              {a.status} · {a.at}
            </p>
            <p className="mt-1 break-all font-mono text-[10px] text-white/35">{a.txId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

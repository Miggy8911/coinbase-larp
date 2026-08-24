"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { formatPrice } from "@/lib/utils";

export function Overlays() {
  const { overlay, setOverlay, receipt } = useApp();
  if (overlay === "none") return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#0A0B0D]">
      <button
        type="button"
        className="px-4 pt-3 text-left text-[14px] text-[#6B9CFF]"
        onClick={() => setOverlay("none")}
      >
        Close
      </button>
      {overlay === "send" && <SendForm />}
      {overlay === "receive" && <ReceiveForm />}
      {overlay === "buy" && <BuyForm />}
      {overlay === "sell" && <Hint goto="trade" />}
      {overlay === "convert" && <Hint goto="trade" />}
      {overlay === "profile" && <Profile />}
      {overlay === "balances" && <Balances />}
      {overlay === "receipt" && receipt && <Receipt />}
    </div>
  );
}

function Hint({ goto }: { goto: string }) {
  const { setOverlay, setTab } = useApp();
  return (
    <div className="px-5 pt-8">
      <p className="text-[16px]">Use the Trade tab to {goto === "trade" ? "sell or convert" : goto}.</p>
      <button
        type="button"
        className="mt-6 h-12 w-full rounded-full bg-[#0052FF] font-semibold"
        onClick={() => {
          setOverlay("none");
          setTab("trade");
        }}
      >
        Open Trade
      </button>
    </div>
  );
}

function SendForm() {
  const { state, sendCrypto } = useApp();
  const [tokenId, setTokenId] = useState(state.tokens[0]?.id ?? "btc");
  const [amount, setAmount] = useState("0.25");
  const [to, setTo] = useState("0xA1b2c3d4e5f678901234567890abcdef12345678");
  const token = state.tokens.find((t) => t.id === tokenId);
  return (
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h2 className="text-[22px] font-semibold">Send</h2>
      <p className="text-[13px] text-white/45">Shows as sent on this device only. Random tx hash.</p>
      <label className="mt-4 text-[12px] text-white/45">To</label>
      <input className="field" value={to} onChange={(e) => setTo(e.target.value)} />
      <label className="mt-3 text-[12px] text-white/45">Asset</label>
      <select className="field" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {state.tokens.map((t) => (
          <option key={t.id} value={t.id}>
            {t.symbol} · bal {t.amount.toLocaleString()}
          </option>
        ))}
      </select>
      <label className="mt-3 text-[12px] text-white/45">Amount</label>
      <input className="field text-[22px] font-semibold" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <p className="mt-2 text-[13px] text-white/45">
        ≈ ${(((Number(amount) || 0) * (token?.priceUsd ?? 0))).toLocaleString()}
      </p>
      <button
        type="button"
        className="mt-auto mb-6 h-12 rounded-full bg-[#0052FF] text-[15px] font-semibold"
        onClick={() => sendCrypto(tokenId, Number(amount) || 0, to)}
      >
        Send now
      </button>
    </div>
  );
}

function ReceiveForm() {
  const { state, receiveCrypto } = useApp();
  const [tokenId, setTokenId] = useState(state.tokens[0]?.id ?? "btc");
  const [amount, setAmount] = useState("1");
  return (
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h2 className="text-[22px] font-semibold">Receive</h2>
      <p className="text-[13px] text-white/45">Pretend an inbound transfer landed. Generates a tx id.</p>
      <div className="mx-auto mt-6 h-40 w-40 rounded-2xl bg-white p-3">
        <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#111_0_8px,transparent_8px_16px),repeating-linear-gradient(0deg,#111_0_8px,transparent_8px_16px)]" />
      </div>
      <p className="mt-4 break-all text-center font-mono text-[11px] text-white/50">
        cb1q-larp-{state.account?.username ?? "user"}-not-real
      </p>
      <select className="field mt-4" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {state.tokens.map((t) => (
          <option key={t.id} value={t.id}>
            Simulate receive {t.symbol}
          </option>
        ))}
      </select>
      <input className="field mt-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button
        type="button"
        className="mt-auto mb-6 h-12 rounded-full bg-[#0052FF] font-semibold"
        onClick={() => receiveCrypto(tokenId, Number(amount) || 0)}
      >
        Simulate incoming
      </button>
    </div>
  );
}

function BuyForm() {
  const { state, buyCrypto } = useApp();
  const [tokenId, setTokenId] = useState(state.tokens[0]?.id ?? "btc");
  const [usd, setUsd] = useState("10000");
  const token = state.tokens.find((t) => t.id === tokenId);
  return (
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h2 className="text-[22px] font-semibold">Buy</h2>
      <select className="field mt-4" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {state.tokens.map((t) => (
          <option key={t.id} value={t.id}>
            {t.symbol} · {formatPrice(t.priceUsd)}
          </option>
        ))}
      </select>
      <input className="field mt-3 text-[22px] font-semibold" value={usd} onChange={(e) => setUsd(e.target.value)} />
      <p className="mt-2 text-[13px] text-white/45">
        ~{token && token.priceUsd ? (Number(usd) / token.priceUsd).toPrecision(5) : "0"} {token?.symbol}
      </p>
      <button
        type="button"
        className="mt-auto mb-6 h-12 rounded-full bg-[#0052FF] font-semibold"
        onClick={() => buyCrypto(tokenId, Number(usd) || 0)}
      >
        Preview buy
      </button>
    </div>
  );
}

function Receipt() {
  const { receipt, setOverlay } = useApp();
  if (!receipt) return null;
  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3DDC97] text-2xl text-black">✓</div>
      <h2 className="mt-4 text-[24px] font-semibold">{receipt.title}</h2>
      <p className="mt-1 text-[16px]">{receipt.amountLabel}</p>
      <p className="mt-1 text-[13px] text-[#3DDC97]">{receipt.status}</p>
      <p className="mt-1 text-[12px] text-white/45">{receipt.at}</p>
      <div className="mt-6 w-full rounded-2xl bg-[#1e2026] p-4 text-left">
        <p className="text-[11px] uppercase tracking-wide text-white/40">Transaction ID</p>
        <p className="mt-1 break-all font-mono text-[12px]">{receipt.txId}</p>
        <p className="mt-3 text-[11px] text-white/40">{receipt.subtitle}</p>
        <p className="mt-1 text-[13px]">{receipt.usdLabel}</p>
      </div>
      <p className="mt-4 text-[12px] text-white/35">Fake ID for screenshots. Nothing left this phone.</p>
      <button
        type="button"
        className="mt-auto mb-6 h-12 w-full rounded-full bg-[#0052FF] font-semibold"
        onClick={() => setOverlay("none")}
      >
        Done
      </button>
    </div>
  );
}

function Profile() {
  const { state, updateAccount, resetBag, setOverlay } = useApp();
  const a = state.account;
  if (!a) return null;
  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8">
      <h2 className="text-[22px] font-semibold">Account</h2>
      <p className="text-[12px] text-white/45">Stored only in this browser.</p>
      <label className="mt-4 block text-[12px] text-white/45">First name</label>
      <input className="field" value={a.firstName} onChange={(e) => updateAccount({ firstName: e.target.value })} />
      <label className="mt-3 block text-[12px] text-white/45">Last name</label>
      <input className="field" value={a.lastName} onChange={(e) => updateAccount({ lastName: e.target.value })} />
      <label className="mt-3 block text-[12px] text-white/45">Username</label>
      <input className="field" value={a.username} onChange={(e) => updateAccount({ username: e.target.value })} />
      <label className="mt-3 block text-[12px] text-white/45">Email</label>
      <input className="field" value={a.email} onChange={(e) => updateAccount({ email: e.target.value })} />
      <button
        type="button"
        className="mt-6 h-11 w-full rounded-full bg-[#1e2026] font-semibold"
        onClick={() => setOverlay("balances")}
      >
        Edit LARP bag
      </button>
      <button
        type="button"
        className="mt-2 h-11 w-full rounded-full bg-[#3a1518] text-[#F0616D] font-semibold"
        onClick={() => {
          if (confirm("Reset fake balances and history?")) resetBag();
        }}
      >
        Reset demo bag
      </button>
    </div>
  );
}

function Balances() {
  const { state, updateTokenAmount, setCash } = useApp();
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8">
      <h2 className="text-[22px] font-semibold">LARP amounts</h2>
      <p className="text-[12px] text-white/45">Prices stay live. You only type quantities.</p>
      <label className="mt-4 block text-[12px] text-white/45">USD cash</label>
      <input
        className="field"
        value={String(state.cashUsd)}
        onChange={(e) => setCash(Number(e.target.value) || 0)}
      />
      {state.tokens.map((t) => (
        <label key={t.id} className="mt-3 block text-[12px] text-white/45">
          {t.name} ({t.symbol})
          <input
            className="field mt-1"
            value={String(t.amount)}
            onChange={(e) => updateTokenAmount(t.id, Number(e.target.value) || 0)}
          />
        </label>
      ))}
    </div>
  );
}

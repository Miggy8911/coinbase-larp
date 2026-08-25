"use client";

import { useState } from "react";
import { Note } from "../Note";
import { AssetSheet } from "./AssetSheet";
import { useApp } from "@/lib/app-context";
import { allocatePortfolio } from "@/lib/allocate";
import { parseMoney } from "@/lib/parse-money";
import { useHoldings } from "@/lib/quotes-store";
import { formatPrice } from "@/lib/utils";

export function Overlays() {
  const { overlay, setOverlay, receipt, state } = useApp();
  if (overlay === "none") return null;
  return (
    <div className="sheet-in absolute inset-0 z-30 flex flex-col overflow-hidden bg-cb-bg">
      <button
        type="button"
        className="tap px-4 pt-3 text-left text-[14px] font-medium text-cb-link"
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
      {overlay === "balances" && (state.editMode ? <Balances /> : <Profile />)}
      {overlay === "receipt" && receipt && <Receipt />}
      {overlay === "asset" && <AssetSheet />}
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
        className="tap mt-6 h-12 w-full rounded-full bg-cb-blue font-semibold"
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
  const { tokens } = useHoldings(state.tokens, state.cashUsd);
  const [tokenId, setTokenId] = useState(tokens[0]?.id ?? "btc");
  const [amount, setAmount] = useState("0.25");
  const [to, setTo] = useState("0xA1b2c3d4e5f678901234567890abcdef12345678");
  const token = tokens.find((t) => t.id === tokenId);
  return (
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h2 className="text-[22px] font-semibold">Send</h2>
      <Note>Shows as sent on this device. Random transaction ID.</Note>
      <label className="mt-4 text-[12px] text-white/45">To</label>
      <input className="field" value={to} onChange={(e) => setTo(e.target.value)} />
      <label className="mt-3 text-[12px] text-white/45">Asset</label>
      <select className="field" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {tokens.map((t) => (
          <option key={t.id} value={t.id}>
            {t.symbol} · bal {t.amount.toLocaleString()}
          </option>
        ))}
      </select>
      <label className="mt-3 text-[12px] text-white/45">Amount</label>
      <input className="field text-[22px] font-semibold tabular-nums" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <p className="mt-2 text-[13px] text-white/45 tabular-nums">
        ≈ ${((Number(amount) || 0) * (token?.priceUsd ?? 0)).toLocaleString()}
      </p>
      <button
        type="button"
        className="tap mt-auto mb-6 h-12 rounded-full bg-cb-blue text-[15px] font-semibold"
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
  const addr = `0x${(state.account?.username ?? "wallet").padEnd(40, "a0").slice(0, 40).replace(/[^a-f0-9]/gi, "a")}`;
  return (
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h2 className="text-[22px] font-semibold">Receive</h2>
      <Note>Inbound transfer for this device only.</Note>
      <div className="mx-auto mt-6 h-40 w-40 rounded-2xl bg-white p-3">
        <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#111_0_8px,transparent_8px_16px),repeating-linear-gradient(0deg,#111_0_8px,transparent_8px_16px)]" />
      </div>
      <p className="mt-4 break-all text-center font-mono text-[11px] text-white/50">{addr}</p>
      <select className="field mt-4" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {state.tokens.map((t) => (
          <option key={t.id} value={t.id}>
            Receive {t.symbol}
          </option>
        ))}
      </select>
      <input className="field mt-2 tabular-nums" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button
        type="button"
        className="tap mt-auto mb-6 h-12 rounded-full bg-cb-blue font-semibold"
        onClick={() => receiveCrypto(tokenId, Number(amount) || 0)}
      >
        Receive
      </button>
    </div>
  );
}

function BuyForm() {
  const { state, buyCrypto } = useApp();
  const { tokens } = useHoldings(state.tokens, state.cashUsd);
  const [tokenId, setTokenId] = useState(tokens[0]?.id ?? "btc");
  const [usd, setUsd] = useState("10000");
  const token = tokens.find((t) => t.id === tokenId);
  return (
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h2 className="text-[22px] font-semibold">Buy</h2>
      <select className="field mt-4" value={tokenId} onChange={(e) => setTokenId(e.target.value)}>
        {tokens.map((t) => (
          <option key={t.id} value={t.id}>
            {t.symbol} · {formatPrice(t.priceUsd)}
          </option>
        ))}
      </select>
      <input className="field mt-3 text-[22px] font-semibold tabular-nums" value={usd} onChange={(e) => setUsd(e.target.value)} />
      <p className="mt-2 text-[13px] text-white/45 tabular-nums">
        ~{token && token.priceUsd ? (Number(usd) / token.priceUsd).toPrecision(5) : "0"} {token?.symbol}
      </p>
      <button
        type="button"
        className="tap mt-auto mb-6 h-12 rounded-full bg-cb-blue font-semibold"
        onClick={() => buyCrypto(tokenId, Number(usd) || 0)}
      >
        Buy
      </button>
    </div>
  );
}

function Receipt() {
  const { receipt, setOverlay } = useApp();
  if (!receipt) return null;
  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cb-up text-2xl text-white">✓</div>
      <h2 className="mt-4 text-[24px] font-semibold">{receipt.title}</h2>
      <p className="mt-1 text-[16px] tabular-nums">{receipt.amountLabel}</p>
      <p className="mt-1 text-[13px] text-cb-up">{receipt.status}</p>
      <p className="mt-1 text-[12px] text-white/45">{receipt.at}</p>
      <div className="mt-6 w-full rounded-2xl bg-cb-elev p-4 text-left">
        <p className="text-[11px] uppercase tracking-wide text-white/40">Transaction ID</p>
        <p className="mt-1 break-all font-mono text-[12px]">{receipt.txId}</p>
        <p className="mt-3 text-[11px] text-white/40">{receipt.subtitle}</p>
        <p className="mt-1 text-[13px] tabular-nums">{receipt.usdLabel}</p>
      </div>
      <Note className="mt-4 text-[12px] text-white/35">ID is generated on this device.</Note>
      <button
        type="button"
        className="tap mt-auto mb-6 h-12 w-full rounded-full bg-cb-blue font-semibold"
        onClick={() => setOverlay("none")}
      >
        Done
      </button>
    </div>
  );
}

function Profile() {
  const { state, updateAccount, resetBag, setOverlay, setShowDisclaimers, setEditMode, setPortfolioValue } =
    useApp();
  const { tokens } = useHoldings(state.tokens, state.cashUsd);
  const [bag, setBag] = useState("1 thousand");
  const [bagError, setBagError] = useState("");
  const a = state.account;
  if (!a) return null;
  const parsed = parseMoney(bag);
  const preview = parsed != null && parsed >= 0 ? allocatePortfolio(parsed, tokens, (t) => t.priceUsd) : null;
  const previewTotal = preview
    ? preview.cashUsd + preview.tokens.reduce((s, t) => s + t.amount * t.priceUsd, 0)
    : 0;
  const previewRows = preview
    ? [...preview.tokens]
        .map((t) => ({ symbol: t.symbol, usd: t.amount * t.priceUsd }))
        .filter((r) => r.usd > 0)
        .sort((a, b) => b.usd - a.usd)
        .slice(0, 6)
    : [];
  return (
    <div className="scroll flex-1 px-4 pt-2 pb-8">
      <h2 className="text-[22px] font-semibold">Account</h2>
      <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-cb-elev px-4 py-3">
        <span>
          <span className="block text-[14px]">Edit mode</span>
          <span className="mt-0.5 block text-[12px] text-white/45">Off hides balance tools</span>
        </span>
        <input
          type="checkbox"
          checked={state.editMode}
          onChange={(e) => setEditMode(e.target.checked)}
          className="h-5 w-5 accent-cb-blue"
        />
      </label>
      {state.editMode ? (
        <>
          <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-cb-elev px-4 py-3">
            <span className="text-[14px]">Show simulator labels</span>
            <input
              type="checkbox"
              checked={state.showDisclaimers}
              onChange={(e) => setShowDisclaimers(e.target.checked)}
              className="h-5 w-5 accent-cb-blue"
            />
          </label>
          <Note className="mt-2">Notices like “not real funds” stay hidden unless this is on.</Note>
          <label className="mt-4 block text-[12px] text-white/45">Portfolio value</label>
          <input
            className="field text-[22px] font-semibold"
            value={bag}
            placeholder="1 thousand"
            onChange={(e) => {
              setBag(e.target.value);
              setBagError("");
            }}
          />
          <p className="mt-2 text-[12px] text-white/45">
            Type an amount like 1000, 1 thousand, or 2.5 million. It splits across Bitcoin, Ethereum, Solana, and the
            rest so the bag looks real.
          </p>
          {preview && parsed && previewTotal > 0 ? (
            <p className="mt-2 text-[12px] text-white/55 tabular-nums">
              {previewRows.map((r) => `${r.symbol} ${((r.usd / Math.max(previewTotal, 1)) * 100).toFixed(0)}%`).join(" · ")}
              {preview.cashUsd > 0 ? ` · USD ${((preview.cashUsd / Math.max(previewTotal, 1)) * 100).toFixed(0)}%` : ""}
            </p>
          ) : null}
          {bagError ? <p className="mt-2 text-[12px] text-cb-down">{bagError}</p> : null}
          <button
            type="button"
            className="tap mt-3 h-11 w-full rounded-full bg-cb-blue font-semibold"
            onClick={() => {
              const n = parseMoney(bag);
              if (n == null) {
                setBagError("Enter an amount like 1000 or 1 thousand.");
                return;
              }
              setPortfolioValue(n);
              setOverlay("none");
            }}
          >
            Set portfolio
          </button>
          <label className="mt-5 block text-[12px] text-white/45">First name</label>
          <input className="field" value={a.firstName} onChange={(e) => updateAccount({ firstName: e.target.value })} />
          <label className="mt-3 block text-[12px] text-white/45">Last name</label>
          <input className="field" value={a.lastName} onChange={(e) => updateAccount({ lastName: e.target.value })} />
          <label className="mt-3 block text-[12px] text-white/45">Username</label>
          <input className="field" value={a.username} onChange={(e) => updateAccount({ username: e.target.value })} />
          <label className="mt-3 block text-[12px] text-white/45">Email</label>
          <input className="field" value={a.email} onChange={(e) => updateAccount({ email: e.target.value })} />
          <button
            type="button"
            className="tap mt-6 h-11 w-full rounded-full bg-cb-elev font-semibold"
            onClick={() => setOverlay("balances")}
          >
            Edit balances
          </button>
          <button
            type="button"
            className="tap mt-2 h-11 w-full rounded-full bg-[#3a1518] text-cb-down font-semibold"
            onClick={() => {
              if (confirm("Reset balances and history?")) resetBag();
            }}
          >
            Reset balances
          </button>
        </>
      ) : (
        <ul className="mt-5 divide-y divide-white/5">
          <li className="flex items-center justify-between py-3 text-[14px]">
            <span className="text-white/50">Name</span>
            <span className="font-medium">
              {a.firstName} {a.lastName}
            </span>
          </li>
          <li className="flex items-center justify-between py-3 text-[14px]">
            <span className="text-white/50">Username</span>
            <span className="font-medium">@{a.username}</span>
          </li>
          <li className="flex items-center justify-between py-3 text-[14px]">
            <span className="text-white/50">Email</span>
            <span className="max-w-[60%] truncate font-medium">{a.email}</span>
          </li>
        </ul>
      )}
    </div>
  );
}

function Balances() {
  const { state, updateTokenAmount, setCash } = useApp();
  return (
    <div className="scroll flex-1 px-4 pb-8">
      <h2 className="text-[22px] font-semibold">Balances</h2>
      <Note>Prices stay live. You only type quantities.</Note>
      <label className="mt-4 block text-[12px] text-white/45">USD cash</label>
      <input
        className="field tabular-nums"
        value={String(state.cashUsd)}
        onChange={(e) => setCash(Number(e.target.value) || 0)}
      />
      {state.tokens.map((t) => (
        <label key={t.id} className="mt-3 block text-[12px] text-white/45">
          {t.name} ({t.symbol})
          <input
            className="field mt-1 tabular-nums"
            value={String(t.amount)}
            onChange={(e) => updateTokenAmount(t.id, Number(e.target.value) || 0)}
          />
        </label>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CoinbaseMark } from "../CoinbaseMark";
import { Note } from "../Note";
import { useApp } from "@/lib/app-context";

export function Onboard() {
  const { createAccount } = useApp();
  const [firstName, setFirst] = useState("Alex");
  const [lastName, setLast] = useState("Rivera");
  const [username, setUser] = useState("arivera");
  const [email, setEmail] = useState("alex@email.com");

  return (
    <div className="flex h-full flex-col bg-[#0A0B0D] px-5 pt-10">
      <CoinbaseMark size={40} />
      <h1 className="mt-6 text-[28px] font-semibold tracking-tight">Create your account</h1>
      <Note className="mt-2 text-[14px] text-white/55">
        Local profile only. No KYC, no real Coinbase account, no real money.
      </Note>
      <label className="mt-6 text-[12px] text-white/45">First name</label>
      <input className="field" value={firstName} onChange={(e) => setFirst(e.target.value)} />
      <label className="mt-3 text-[12px] text-white/45">Last name</label>
      <input className="field" value={lastName} onChange={(e) => setLast(e.target.value)} />
      <label className="mt-3 text-[12px] text-white/45">Username</label>
      <input className="field" value={username} onChange={(e) => setUser(e.target.value)} />
      <label className="mt-3 text-[12px] text-white/45">Email</label>
      <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button
        type="button"
        className="tap mt-auto mb-6 h-12 rounded-full bg-[#0052FF] text-[15px] font-semibold"
        onClick={() =>
          createAccount({
            firstName: firstName.trim() || "Alex",
            lastName: lastName.trim() || "Rivera",
            username: username.trim() || "arivera",
            email: email.trim() || "alex@email.com",
          })
        }
      >
        Create account
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckoutButton } from "@/components/ui/CheckoutButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreditPackModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-dialog border border-outline-variant/30 p-8 max-w-lg w-full">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Buy Credit Packs</h2>
        <p className="text-body-md text-on-surface-variant mb-6">Credits never expire. One credit = one evaluation.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-5 text-center flex flex-col">
            <span className="font-mono text-display-md font-extrabold text-primary mb-1">10</span>
            <p className="text-label-sm text-on-surface-variant mb-4">credits</p>
            <CheckoutButton planSlug="credit_pack_10" label="$7.99 — Buy 10" featured={false} href="/register?plan=credit_pack_10" />
          </div>
          <div className="bg-surface-container rounded-xl border border-primary/30 p-5 text-center flex flex-col relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-label-sm font-bold">Save 20%</span>
            <span className="font-mono text-display-md font-extrabold text-primary mb-1 mt-2">25</span>
            <p className="text-label-sm text-on-surface-variant mb-4">credits</p>
            <CheckoutButton planSlug="credit_pack_25" label="$14.99 — Buy 25" featured={true} href="/register?plan=credit_pack_25" />
          </div>
        </div>
      </div>
    </div>
  );
}

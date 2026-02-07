"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { anvil, baseSepolia } from "wagmi/chains";
import { targetChainId } from "@/lib/wagmiConfig";

export function EnsureChain() {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected) return null;

  const wrong = chain?.id !== targetChainId;
  if (!wrong) return null;

  const target = targetChainId === baseSepolia.id ? baseSepolia : anvil;

  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>Wrong network. Switch to <span className="font-mono">{target.name}</span>.</div>
        <button
          className="rounded-md bg-amber-400 px-3 py-1.5 font-medium text-black disabled:opacity-50"
          disabled={isPending}
          onClick={() => switchChain({ chainId: target.id })}
        >
          {isPending ? "Switching…" : "Switch"}
        </button>
      </div>
      {error ? (
        <div className="mt-2 text-xs text-amber-200/80">{error.message}</div>
      ) : null}
    </div>
  );
}

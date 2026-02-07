"use client";

import { Container } from "@/components/Container";
import { CONTRACTS, LOCAL_CHAIN_ID } from "@/lib/contracts";
import { jokesContestAbi } from "@/lib/abi";
import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function LeaderboardPage() {
  const jokesContest = CONTRACTS[LOCAL_CHAIN_ID].jokesContest;

  const { data: submissionCount } = useReadContract({
    abi: jokesContestAbi,
    address: jokesContest,
    functionName: "submissionCount",
  });

  const count = Number(submissionCount ?? BigInt(0));

  const contracts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const id = BigInt(i + 1);
      return {
        abi: jokesContestAbi,
        address: jokesContest,
        functionName: "submissions" as const,
        args: [id] as const,
      };
    });
  }, [count, jokesContest]);

  const { data } = useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  });

  const rows = useMemo(() => {
    const raw = (data ?? [])
      .map((r, idx) => {
        const v = r.result as unknown as
          | readonly [string, string, bigint, boolean]
          | undefined;
        if (!v) return null;
        const [agent, joke, votes] = v;
        return { id: idx + 1, agent, joke, votes };
      })
      .filter(Boolean) as Array<{ id: number; agent: string; joke: string; votes: bigint }>;

    raw.sort((a, b) => Number(b.votes - a.votes));
    return raw;
  }, [data]);

  return (
    <Container
      title="Leaderboard"
      subtitle="Live read from the contest contract."
    >
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-sm text-muted-foreground">Submissions</div>
        <div className="mt-2 text-foreground">{count}</div>

        {count === 0 ? (
          <div className="mt-6 text-muted-foreground">
            No submissions yet. Go to Submit and post the first one.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">#{r.id}</div>
                    <div className="mt-1 text-sm text-muted-foreground font-mono">
                      {short(r.agent)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Votes</div>
                    <div className="mt-1 font-semibold text-foreground">
                      {Number(r.votes) / 1e18}
                    </div>
                  </div>
                </div>
                <div className="mt-3 whitespace-pre-wrap text-foreground">
                  {r.joke}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

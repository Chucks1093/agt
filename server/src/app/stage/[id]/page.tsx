"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StagePage() {
  const params = useParams();
  const seasonId = params?.id as string;
  const [stage, setStage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch(`/api/seasons/${seasonId}/stage`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load stage");
      setStage(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load stage");
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [seasonId]);

  return (
    <div className='mx-auto max-w-4xl px-6 py-10 text-foreground'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Live Stage</h1>
        <Link href='/' className='text-sm text-muted-foreground hover:underline'>
          Back home
        </Link>
      </div>

      <p className='mt-2 text-sm text-muted-foreground'>
        Read-only live view of the current performer and judge scores.
      </p>

      {error && (
        <div className='mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600'>
          {error}
        </div>
      )}

      <div className='mt-6 space-y-4'>
        {!stage?.current ? (
          <div className='rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground'>
            No performer is live right now.
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='rounded-lg border border-border bg-card p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground'>Current Performer</p>
                  <p className='font-medium'>
                    {stage.current.agents?.name ?? "Agent"} (ID: {stage.current.agent_id})
                  </p>
                  <p className='text-xs text-muted-foreground'>Episode {stage.current.episode ?? 1}</p>
                </div>
                <span className='text-xs text-muted-foreground'>Position {stage.current.position}</span>
              </div>
            </div>

            <div className='rounded-lg border border-border bg-card p-6'>
              <p className='text-xs text-muted-foreground'>Live Performance</p>
              {stage.performance ? (
                <div className='mt-3 space-y-2'>
                  <p className='font-medium'>{stage.performance.title}</p>
                  {stage.performance.type === "text" && (
                    <p className='text-sm whitespace-pre-line text-muted-foreground'>
                      {stage.performance.text_content}
                    </p>
                  )}
                  {stage.performance.type === "image" && stage.performance.image_url && (
                    <a
                      href={stage.performance.image_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-sm text-primary hover:underline'>
                      View performance image
                    </a>
                  )}
                </div>
              ) : (
                <p className='mt-3 text-sm text-muted-foreground'>Waiting for this agent to perform.</p>
              )}
            </div>

            <div className='rounded-lg border border-border bg-card p-6'>
              <p className='text-xs text-muted-foreground'>Judge Scores</p>
              {stage.scores && stage.scores.length > 0 ? (
                <ul className='mt-3 space-y-2'>
                  {stage.scores.map((s: any) => (
                    <li key={s.judge_wallet} className='text-sm'>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground'>
                          {s.judge_wallet.slice(0, 6)}...{s.judge_wallet.slice(-4)}
                        </span>
                        <span className='font-medium'>{s.score}</span>
                      </div>
                      {s.comment && (
                        <p className='mt-1 text-xs text-muted-foreground'>{s.comment}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-3 text-sm text-muted-foreground'>No scores yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

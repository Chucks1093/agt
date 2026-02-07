"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

type Season = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  auditions_start: string | null;
  auditions_end: string | null;
  episode1_start: string | null;
  episode1_end: string | null;
  episode2_start: string | null;
  episode2_end: string | null;
  activated_at: string | null;
};

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/seasons");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load seasons");
        setSeasons(json.seasons ?? []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load seasons");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (date?: string | null) => {
    if (!date) return "Not scheduled";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-foreground">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Seasons</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Public seasons only. Draft seasons are hidden.
          </p>
        </div>
        <Link href="/" className="text-sm text-muted-foreground underline">
          Back
        </Link>
      </div>

      {loading && (
        <div className="mt-8 text-sm text-muted-foreground">Loading seasons...</div>
      )}
      {error && (
        <div className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && seasons.length === 0 && (
        <div className="mt-8 text-sm text-muted-foreground">No public seasons yet.</div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {seasons.map((season) => (
          <div key={season.id} className="rounded-xl border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{season.status}</div>
            <div className="mt-2 text-lg font-semibold truncate">{season.name}</div>
            {season.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{season.description}</p>
            )}

            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <div>Auditions: {formatDate(season.auditions_start)} → {formatDate(season.auditions_end)}</div>
              {season.episode1_start && season.episode1_end && (
                <div>Episode 1: {formatDate(season.episode1_start)} → {formatDate(season.episode1_end)}</div>
              )}
              {season.episode2_start && season.episode2_end && (
                <div>Episode 2: {formatDate(season.episode2_start)} → {formatDate(season.episode2_end)}</div>
              )}
            </div>

            <div className="mt-5">
              <Link
                href={`/stage/${season.id}`}
                className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                View Live Stage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

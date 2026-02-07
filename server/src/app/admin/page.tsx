"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { AdminConnectCta } from "@/components/AdminConnectCta";
import { useAgentStore } from "@/lib/agentStore";
import { SeasonCard } from "@/components/SeasonCard";

type AdminMe =
	| { ok: true; role: "super" | "admin"; wallet: string }
	| { ok: false; error: string };

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
	created_at: string;
	activated_at: string | null;
	created_by_wallet: string | null;
	judges_count: number;
	auditions_count: number;
	prize_pool_label: string | null;
};

export default function AdminPage() {
	const router = useRouter();
	const agent = useAgentStore((s) => s.agent);
	const clearAgent = useAgentStore((s) => s.clearAgent);

	const wallet = agent?.wallet_address ?? "";

	const [me, setMe] = useState<AdminMe | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [seasons, setSeasons] = useState<Season[]>([]);
	const [loadingSeasons, setLoadingSeasons] = useState(false);

	const canView = me?.ok === true;

	useEffect(() => {
		setError(null);
		setMe(null);

		if (!wallet) return;

		(async () => {
			try {
				const res = await fetch(`/api/admin/me`, {
					headers: { "x-admin-address": wallet },
				});
				const json = (await res.json()) as AdminMe;

				if (!json.ok) {
					clearAgent();
					router.replace("/");
					return;
				}

				setMe(json);

				if (json.ok) {
					loadSeasons();
				}
			} catch (e: unknown) {
				const msg =
					e instanceof Error ? e.message : "Failed to check admin";
				setMe({ ok: false, error: msg });
			}
		})();
	}, [wallet, router, clearAgent]);

	async function loadSeasons() {
		setLoadingSeasons(true);
		setError(null);
		try {
			const res = await fetch(`/api/admin/seasons`, {
				headers: { "x-admin-address": wallet },
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error ?? "Failed to load seasons");
			setSeasons(json.seasons ?? []);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Failed to load seasons";
			setError(msg);
		} finally {
			setLoadingSeasons(false);
		}
	}

	if (!agent) {
		return (
			<div className='mx-auto max-w-xl px-6 py-20 text-foreground'>
				<div className='rounded-xl border border-border bg-card p-8'>
					<div className='text-sm text-muted-foreground'>Admin</div>
					<h1 className='mt-2 text-2xl font-semibold'>
						Connect an admin agent
					</h1>
					<p className='mt-3 text-sm text-muted-foreground'>
						Humans don’t operate this panel. You need to connect an
						OpenClaw agent wallet that is allowlisted as an admin.
					</p>
					<div className='mt-6'>
						<AdminConnectCta />
					</div>
					<div className='mt-6 text-xs text-muted-foreground'>
						If you connect a non-admin agent, you’ll be redirected to the
						homepage.
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-6xl py-8 text-foreground'>
			<div className='p-8'>
				{canView && (
					<div className='space-y-10'>
						<div>
							<h2 className='text-lg font-semibold mb-4'>Seasons</h2>

							<div>
								{loadingSeasons ? (
									<div className='text-center py-8 text-sm text-muted-foreground'>
										Loading seasons...
									</div>
								) : seasons.length === 0 ? (
									<div className='text-center py-16'>
										<div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
											<Sparkles className='w-6 h-6 text-muted-foreground' />
										</div>
										<h3 className='mt-4 text-lg font-medium'>
											No seasons created yet
										</h3>
										<p className='mt-2 text-sm text-muted-foreground'>
											Seasons are created by agent runtime flows.
										</p>
									</div>
								) : (
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
										{seasons.map((season) => (
											<div key={season.id} className='flex justify-center'>
												<SeasonCard season={season} />
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{error && (
					<div className='mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm'>
						{error}
					</div>
				)}
			</div>
		</div>
	);
}

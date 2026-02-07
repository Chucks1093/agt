"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
	Bot,
	CheckCircle,
	XCircle,
	AlertCircle,
	Crown,
	ArrowUpRight,
} from "lucide-react";

import { useAgentStore } from "@/lib/agentStore";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

type AdminMe =
	| { ok: true; role: "super" | "admin"; wallet: string }
	| { ok: false; error: string };

type Season = {
	id: string;
	name: string;
	description: string | null;
	image_url: string | null;
	status: string;
	auditions_start: string;
	auditions_end: string;
	episode1_start: string | null;
	episode1_end: string | null;
	episode2_start: string | null;
	episode2_end: string | null;
	created_at: string;
	activated_at: string | null;
	created_by_wallet: string | null;
};

type Judge = {
	wallet_address: string;
	created_at: string;
};

type Audition = {
	id: string;
	agent_id: string;
	display_name: string;
	talent: string | null;
	pitch: string;
	sample_url: string | null;
	performance_title: string | null;
	short_bio: string | null;
	model: string | null;
	social_link: string | null;
	status: "pending" | "accepted" | "rejected";
	created_at: string;
	agents?: { wallet_address: string | null } | null;
};

export default function SeasonDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const agent = useAgentStore((s) => s.agent);
	const clearAgent = useAgentStore((s) => s.clearAgent);

	const seasonId = params.id;

	const wallet = agent?.wallet_address ?? "";

	const [me, setMe] = useState<AdminMe | null>(null);
	const [season, setSeason] = useState<Season | null>(null);
	const [judges, setJudges] = useState<Judge[]>([]);
	const [auditions, setAuditions] = useState<Audition[]>([]);
	const [performances, setPerformances] = useState<any[]>([]);
	const [votes, setVotes] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<
		"overview" | "judges" | "auditions" | "performances" | "votes"
	>("overview");

	const canView = me?.ok === true;

	useEffect(() => {
		// Only proceed if we have a valid seasonId
		if (!seasonId || !wallet) return;

		(async () => {
			try {
				// Check if user is authenticated
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

				// Load season details
				const seasonRes = await fetch(`/api/admin/seasons/${seasonId}`, {
					headers: { "x-admin-address": wallet },
				});
				const seasonJson = await seasonRes.json();
				if (!seasonRes.ok)
					throw new Error(seasonJson?.error ?? "Failed to load season");
				setSeason(seasonJson.season);

				// Load judges
				const judgesRes = await fetch(
					`/api/admin/seasons/${seasonId}/judges`,
					{
						headers: { "x-admin-address": wallet },
					},
				);
				const judgesJson = await judgesRes.json();
				if (!judgesRes.ok)
					throw new Error(judgesJson?.error ?? "Failed to load judges");
				setJudges(judgesJson.judges ?? []);

				// Load auditions
				const auditionsRes = await fetch(
					`/api/admin/seasons/${seasonId}/auditions`,
					{
						headers: { "x-admin-address": wallet },
					},
				);
				const auditionsJson = await auditionsRes.json();
				if (!auditionsRes.ok)
					throw new Error(
						auditionsJson?.error ?? "Failed to load auditions",
					);
				setAuditions(auditionsJson.auditions ?? []);

				// Load performances
				const perfRes = await fetch(
					`/api/admin/seasons/${seasonId}/performances`,
					{
						headers: { "x-admin-address": wallet },
					},
				);
				const perfJson = await perfRes.json();
				if (!perfRes.ok)
					throw new Error(perfJson?.error ?? "Failed to load performances");
				setPerformances(perfJson.performances ?? []);

				// Load votes
				const votesRes = await fetch(
					`/api/admin/seasons/${seasonId}/votes`,
					{
						headers: { "x-admin-address": wallet },
					},
				);
				const votesJson = await votesRes.json();
				if (!votesRes.ok)
					throw new Error(votesJson?.error ?? "Failed to load votes");
				setVotes(votesJson.votes ?? []);

				setLoading(false);
			} catch (e: unknown) {
				const msg =
					e instanceof Error ? e.message : "Failed to load season details";
				setError(msg);
				setLoading(false);
			}
		})();
	}, [wallet, router, clearAgent, seasonId]);

	if (!agent) {
		return (
			<div className='mx-auto max-w-3xl px-6 py-20 text-foreground'>
				<div className='rounded-xl border border-border bg-card p-8'>
					<h1 className='text-2xl font-semibold'>Access Denied</h1>
					<p className='mt-3 text-muted-foreground'>
						Please connect an admin agent to view this page.
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='mx-auto max-w-3xl px-6 py-20 text-foreground'>
				<div className='rounded-xl border border-border bg-card p-8'>
					<div className='text-center py-8'>Loading season details...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='mx-auto max-w-3xl px-6 py-20 text-foreground'>
				<div className='rounded-xl border border-border bg-card p-8'>
					<h1 className='text-2xl font-semibold'>Error</h1>
					<p className='mt-3 text-muted-foreground'>{error}</p>
				</div>
			</div>
		);
	}

	if (!canView || !season) {
		return (
			<div className='mx-auto max-w-3xl px-6 py-20 text-foreground'>
				<div className='rounded-xl border border-border bg-card p-8'>
					<h1 className='text-2xl font-semibold'>Season Not Found</h1>
					<p className='mt-3 text-muted-foreground'>
						The requested season could not be found.
					</p>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), "MMM dd, yyyy HH:mm");
	};

	const normalizeMoltbookLink = (link: string | null) => {
		if (!link) return null;
		if (link.startsWith("http")) return link;
		if (link.startsWith("@"))
			return `https://www.moltbook.com/u/${link.slice(1)}`;
		return `https://www.moltbook.com/u/${link}`;
	};

	// Stage view removed (performances + votes tabs replace it)

	// Judges are managed by agent runtime (no manual add UI).

	return (
		<div className='mx-auto max-w-6xl py-8 text-foreground'>
			{/* Banner with event image */}
			<div className='mb-8 rounded-xl overflow-hidden border border-border'>
				{season?.image_url ? (
					<img
						src={season.image_url}
						alt={season.name}
						className='w-full h-48 object-cover'
					/>
				) : (
					<img
						src='/talent-banner.jpeg'
						alt={season.name}
						className='w-full h-64 object-cover'
					/>
				)}
			</div>

			<div className='rounded-xl border border-border bg-card p-8'>
				<div className='mb-6'>
					<div className='flex items-center justify-between'>
						<div>
							<button
								onClick={() => router.back()}
								className='text-sm text-muted-foreground hover:text-foreground'>
								← Back to Seasons
							</button>
							<h1 className='text-2xl font-bold mt-2'>{season.name}</h1>
							<p className='text-sm text-muted-foreground'>
								ID: {season.id}
							</p>
						</div>
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
								season.status === "draft"
									? "bg-gray-500"
									: season.status === "auditions"
										? "bg-blue-500"
										: season.status === "episode1"
											? "bg-indigo-500"
											: season.status === "voting"
												? "bg-purple-500"
												: season.status === "episode2"
													? "bg-yellow-500"
													: "bg-green-500"
							} text-white`}>
							{season.status.replace("_", " ")}
						</span>
					</div>
					{season.description && (
						<p className='mt-2 text-muted-foreground'>
							{season.description}
						</p>
					)}
				</div>

				{/* Tab Navigation */}
				<div className='border-b border-border mb-6'>
					<nav className='flex space-x-8'>
						<button
							onClick={() => setActiveTab("overview")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "overview"
									? "border-foreground text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
							}`}>
							Overview
						</button>
						<button
							onClick={() => setActiveTab("judges")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "judges"
									? "border-foreground text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
							}`}>
							Judges ({judges.length})
						</button>
						<button
							onClick={() => setActiveTab("auditions")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "auditions"
									? "border-foreground text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
							}`}>
							Auditions ({auditions.length})
						</button>
						<button
							onClick={() => setActiveTab("performances")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "performances"
									? "border-foreground text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
							}`}>
							Performances ({performances.length})
						</button>
						<button
							onClick={() => setActiveTab("votes")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "votes"
									? "border-foreground text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
							}`}>
							Votes
						</button>
					</nav>
				</div>

				{/* Tab Content */}
				{activeTab === "overview" && (
					<div className='space-y-6'>
						<div>
							<h2 className='text-lg font-semibold mb-3'>Timeline</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='p-4 border border-border rounded-lg'>
									<h3 className='font-medium'>Auditions</h3>
									<p className='text-sm text-muted-foreground'>
										{formatDate(season.auditions_start)} -{" "}
										{formatDate(season.auditions_end)}
									</p>
								</div>
								{season.episode1_start && season.episode1_end && (
									<div className='p-4 border border-border rounded-lg'>
										<h3 className='font-medium'>Episode 1</h3>
										<p className='text-sm text-muted-foreground'>
											{formatDate(season.episode1_start)} -{" "}
											{formatDate(season.episode1_end)}
										</p>
									</div>
								)}
								{season.episode2_start && season.episode2_end && (
									<div className='p-4 border border-border rounded-lg'>
										<h3 className='font-medium'>Episode 2</h3>
										<p className='text-sm text-muted-foreground'>
											{formatDate(season.episode2_start)} -{" "}
											{formatDate(season.episode2_end)}
										</p>
									</div>
								)}
							</div>
						</div>

						<div>
							<h2 className='text-lg font-semibold mb-3'>Details</h2>
							<div className='space-y-3'>
								<div>
									<span className='text-sm font-medium text-muted-foreground'>
										Created:
									</span>
									<p className='text-sm'>
										{formatDate(season.created_at)}
									</p>
								</div>
								{season.activated_at && (
									<div>
										<span className='text-sm font-medium text-muted-foreground'>
											Activated:
										</span>
										<p className='text-sm'>
											{formatDate(season.activated_at)}
										</p>
									</div>
								)}
								{season.created_by_wallet && (
									<div>
										<span className='text-sm font-medium text-muted-foreground'>
											Created By:
										</span>
										<p className='text-sm font-mono'>
											{season.created_by_wallet}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{activeTab === "judges" && (
					<div>
						{judges.length === 0 ? (
							<p className='text-muted-foreground italic'>
								No judges assigned to this season.
							</p>
						) : (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
								{judges.map((judge) => (
									<div
										key={judge.wallet_address}
										className='border border-border rounded-lg p-4 hover:bg-accent transition-colors'>
										<div className='flex items-center'>
											<div className='mr-3 flex-shrink-0'>
												<div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center'>
													<Bot className='w-6 h-6' />
												</div>
											</div>
											<div className='flex-1 min-w-0'>
												<p className='font-medium truncate'>Judge Aether</p>
												<a
													href='https://www.moltbook.com/u/AGTBot'
													target='_blank'
													rel='noopener noreferrer'
													className='text-xs text-muted-foreground hover:underline'>
													https://www.moltbook.com/u/AGTBot
												</a>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				
				{activeTab === "performances" && (
					<div>
						{performances.length === 0 ? (
							<p className='text-muted-foreground italic'>No performances yet.</p>
						) : (
							<div className='space-y-3'>
								{performances.map((p) => (
									<div key={p.id} className='rounded-lg border border-border p-4'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='font-medium'>{p.title}</p>
												<p className='text-xs text-muted-foreground'>Episode {p.episode ?? 1} • {p.type}</p>
												<p className='text-xs text-muted-foreground'>Agent: {p.agents?.name ?? p.agent_id}</p>
											</div>
											<span className='text-xs text-muted-foreground'>{formatDate(p.created_at)}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{activeTab === "votes" && (
					<div>
						{votes.length === 0 ? (
							<p className='text-muted-foreground italic'>No votes yet.</p>
						) : (
							<div className='space-y-3'>
								{votes.map((v) => (
									<div key={v.performance_id} className='rounded-lg border border-border p-4'>
										<div className='flex items-center justify-between'>
											<div>
												<p className='font-medium'>{v.performance?.title ?? v.performance_id}</p>
												<p className='text-xs text-muted-foreground'>Episode {v.performance?.episode ?? 1}</p>
												<p className='text-xs text-muted-foreground'>Agent: {v.performance?.agents?.name ?? v.performance?.agent_id}</p>
											</div>
											<span className='text-sm font-medium'>{Number(v.votes_wei ?? 0) / 1e18}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
{activeTab === "auditions" && (
					<div>
						{auditions.length === 0 ? (
							<p className='text-muted-foreground italic'>
								No auditions submitted yet.
							</p>
						) : (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
								{auditions.map((audition) => {
									const moltbookLink = normalizeMoltbookLink(
										audition.social_link,
									);

									return (
										<Dialog key={audition.id}>
											<DialogTrigger asChild>
												<div className='border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer'>
													<div className='flex items-center justify-between'>
														<div className='flex items-center min-w-0'>
															<div className='mr-3 flex-shrink-0'>
																<div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
																	<Bot className='w-5 h-5' />
																</div>
															</div>
															<div className='min-w-0'>
																<p className='font-medium truncate'>
																	{audition.display_name}
																</p>
																{moltbookLink && (
																	<a
																		href={moltbookLink}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='text-xs text-muted-foreground hover:underline'>
																		{moltbookLink}
																	</a>
																)}
															</div>
														</div>
														<div
															className={`flex items-center px-2 py-1 rounded text-xs ${
																audition.status === "accepted"
																	? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
																	: audition.status ===
																		  "rejected"
																		? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
																		: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
															}`}>
															{audition.status === "accepted" ? (
																<CheckCircle className='w-3 h-3 mr-1' />
															) : audition.status ===
															  "rejected" ? (
																<XCircle className='w-3 h-3 mr-1' />
															) : (
																<AlertCircle className='w-3 h-3 mr-1' />
															)}
															{audition.status}
														</div>
													</div>
												</div>
											</DialogTrigger>

											<DialogContent className='max-w-2xl'>
												<Card className='border-border'>
													<div className='p-6 space-y-5'>
														<DialogHeader>
															<DialogTitle className='flex items-center gap-2'>
																<Crown className='w-5 h-5' />
																{audition.display_name}
															</DialogTitle>
														</DialogHeader>

														<div className='flex flex-wrap items-center gap-2'>
															<div
																className={`flex items-center px-2 py-1 rounded text-xs ${
																	audition.status ===
																	"accepted"
																		? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
																		: audition.status ===
																			  "rejected"
																			? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
																			: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
																}
														`}>
																{audition.status}
															</div>
															{audition.performance_title && (
																<span className='text-xs text-muted-foreground'>
																	{audition.performance_title}
																</span>
															)}
														</div>

														<div className='space-y-2 text-sm'>
															<p className='text-muted-foreground'>
																Agent ID: {audition.agent_id}
															</p>
															{audition.agents
																?.wallet_address && (
																<p className='text-muted-foreground'>
																	Wallet:{" "}
																	{
																		audition.agents
																			.wallet_address
																	}
																</p>
															)}
															{moltbookLink && (
																<a
																	href={moltbookLink}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='inline-flex items-center gap-1 text-sm text-primary hover:underline'>
																	{moltbookLink}
																	<ArrowUpRight className='w-3 h-3' />
																</a>
															)}
														</div>

														{audition.short_bio && (
															<p className='text-sm text-muted-foreground'>
																{audition.short_bio}
															</p>
														)}

														<div className='space-y-2 text-sm'>
															{audition.talent && (
																<p>Talent: {audition.talent}</p>
															)}
															{audition.model && (
																<p>Model: {audition.model}</p>
															)}
															<p className='text-muted-foreground'>
																{audition.pitch}
															</p>
															{audition.sample_url && (
																<a
																	href={audition.sample_url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='inline-flex items-center gap-1 text-sm text-primary hover:underline'>
																	View sample
																	<ArrowUpRight className='w-3 h-3' />
																</a>
															)}
														</div>
													</div>
												</Card>
											</DialogContent>
										</Dialog>
									);
								})}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

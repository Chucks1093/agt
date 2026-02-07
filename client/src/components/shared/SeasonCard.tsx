import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

interface Season {
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
}

interface SeasonCardProps {
	season: Season;
}

export function SeasonCard({ season }: SeasonCardProps) {
	const normalizeStatus = (status: string) => {
		switch (status) {
			case 'auditions':
				return 'audition';
			case 'episode1':
				return 'episode 1';
			case 'voting':
				return 'voting';
			case 'episode2':
				return 'episode 2';
			case 'closed':
				return 'closed';
			default:
				return 'draft';
		}
	};

	const getStatusColor = (status: string) => {
		switch (normalizeStatus(status)) {
			case 'draft':
				return 'bg-gray-500';
			case 'audition':
				return 'bg-blue-500';
			case 'episode 1':
				return 'bg-indigo-500';
			case 'voting':
				return 'bg-purple-500';
			case 'episode 2':
				return 'bg-yellow-500';
			case 'closed':
				return 'bg-green-500';
			default:
				return 'bg-gray-500';
		}
	};

	return (
		<div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors duration-200 hover:bg-accent">
			<div className="relative overflow-hidden rounded-xl border border-border">
				{season.image_url ? (
					<div className="relative w-full h-48">
						<img
							src={season.image_url}
							alt="Dark, premium season card banner with a subtle tech pattern, clean typography, and spotlighted title area"
							className="object-cover h-full w-full"
						/>
					</div>
				) : (
					<div className="w-full h-48 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 text-white flex items-center justify-center">
						<Sparkles className="w-8 h-8 opacity-80" />
					</div>
				)}
				<div className="absolute top-3 right-3">
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(season.status)} text-white shadow`}
					>
						{normalizeStatus(season.status)}
					</span>
				</div>
			</div>

			<div className="mt-3">
				<h3 className="text-lg font-semibold truncate">{season.name}</h3>
				{season.description && (
					<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
						{season.description}
					</p>
				)}

				<div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
					<div>
						<div className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
							Prize pool
						</div>
						<div className="text-sm font-medium text-foreground">
							{season.prize_pool_label ?? 'TBD'}
						</div>
					</div>
					<div>
						<div className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
							Judges
						</div>
						<div className="text-sm font-medium text-foreground">
							{season.judges_count}
						</div>
					</div>
					<div>
						<div className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
							Auditions
						</div>
						<div className="text-sm font-medium text-foreground">
							{season.auditions_count} agents
						</div>
					</div>
				</div>

				<div className="mt-4">
					<Link
						to={`/admin/seasons/${season.id}`}
						className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
					>
						See more details
					</Link>
				</div>
			</div>
		</div>
	);
}

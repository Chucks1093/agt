import * as React from 'react';
import { Bot, Star, ShieldCheck, Gauge, Hash, Layers } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import type { SeasonJudge } from '@shared/season.types';

type SeasonJudgeCardProps = Pick<
	SeasonJudge,
	| 'agent_name'
	| 'agent_id'
	| 'specialization'
	| 'bio'
	| 'reputation_score'
	| 'is_active'
	| 'total_performances_judged'
	| 'average_score_given'
	| 'strictness_rating'
	| 'assigned_at'
>;

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
			{children}
		</span>
	);
};

const StatRow: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}> = ({ icon, label, value }) => {
	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-3 py-2">
			<div className="flex items-center gap-2 text-sm text-gray-600">
				<span className="text-gray-500">{icon}</span>
				<span>{label}</span>
			</div>
			<div className="text-sm font-semibold text-gray-900">{value}</div>
		</div>
	);
};

const SeasonJudgeCard: React.FC<SeasonJudgeCardProps> = props => {
	const specialization = props.specialization?.length
		? props.specialization
		: ['other'];
	const assignedAt = props.assigned_at
		? new Date(props.assigned_at).toLocaleDateString()
		: 'Unknown';

	return (
		<Dialog>
			<DialogTrigger asChild>
				<article className="group flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all">
					<div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-500">
						<Bot size={20} />
					</div>

					<div className="min-w-0 flex-1 pr-4">
						<h3 className="truncate text-sm font-semibold text-gray-700 font-manrope">
							{props.agent_name}
						</h3>
						<p className="truncate text-xs text-gray-400 mt-1">
							{props.agent_id}
						</p>
					</div>
				</article>
			</DialogTrigger>

			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
							<Bot size={18} />
						</span>
						<span className="min-w-0">
							<span className="block truncate text-base font-semibold text-gray-900">
								{props.agent_name}
							</span>
							<span className="mt-0.5 block truncate text-sm text-gray-500">
								{props.agent_id}
							</span>
						</span>
					</DialogTitle>
				</DialogHeader>

				<div className="mt-2 space-y-4">
					<div className="flex flex-wrap gap-2">
						{specialization.map(cat => (
							<Badge key={cat}>{cat}</Badge>
						))}
						{props.is_active ? (
							<Badge>Active</Badge>
						) : (
							<Badge>Inactive</Badge>
						)}
					</div>

					{props.bio ? (
						<p className="text-sm text-gray-700 leading-relaxed">
							{props.bio}
						</p>
					) : (
						<p className="text-sm text-gray-500">No bio provided.</p>
					)}

					<div className="grid gap-2">
						<StatRow
							icon={<Star size={16} />}
							label="Reputation score"
							value={props.reputation_score ?? 'N/A'}
						/>
						<StatRow
							icon={<Layers size={16} />}
							label="Performances judged"
							value={props.total_performances_judged}
						/>
						<StatRow
							icon={<Gauge size={16} />}
							label="Average score given"
							value={props.average_score_given.toFixed(1)}
						/>
						<StatRow
							icon={<ShieldCheck size={16} />}
							label="Strictness rating"
							value={props.strictness_rating ?? 'N/A'}
						/>
						<StatRow
							icon={<Hash size={16} />}
							label="Assigned at"
							value={assignedAt}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SeasonJudgeCard;

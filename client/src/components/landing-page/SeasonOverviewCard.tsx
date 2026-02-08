import { Bot } from 'lucide-react';
import type { Season } from '@shared/season.types';
import { SeasonStatusBadge } from '../shared/StatusBadge';

interface SeasonOverviewCardProps extends Season {
	key?: string;
	className?: string;
}

const SeasonOverviewCard = (props: SeasonOverviewCardProps) => {
	const isNotActive =
		props.status == 'UPCOMING' || props.status == 'COMPLETED';

	return (
		<div
			className={`rounded-3xl h-fit border border-gray-200 p-2 overflow-hidden transition-all bg-black relative ${isNotActive && 'opacity-50'} ${props.className}`}
		>
			<SeasonStatusBadge
				status={props.status}
				className="border w-fit ml-auto mt-3 mr-3 rounded-2xl top-3 right-3 z-10"
			/>

			{/* Content */}
			<div className="p-4">
				{/* Title */}
				<p className="text-sm text-gray-400 mb-2">Title</p>
				<h3 className="text-xl font-semibold font-manrope text-gray-100 mb-3 overflow-hidden line-clamp-2">
					{props.title}
				</h3>

				{/* Description */}
				<p className="text-sm text-gray-400 mb-2 mt-5">Description</p>
				<p className="text-gray-100  text-base">{props.description}</p>

				<div className=".border-t-2 mt-4 py-2 border-gray-200 border-dashed flex items-center justify-between">
					<div>
						<p className="text-xs text-gray-400 ">Prize</p>
						<div className="flex items-center py-2 gap-1">
							<img
								src="/icons/trophy.svg"
								className="size-5 text-gray-700"
								alt="Prize"
							/>
							<p className="font-manrope font-bold text-gray-300">
								{props.prize_pool_agt.toLocaleString()} $AGT
							</p>
						</div>
					</div>

					<div>
						<p className="text-xs text-gray-400">Participants</p>

						<div className="flex items-center py-2 gap-1">
							<Bot className="size-6 text-gray-200" />
							<p className="font-manrope font-bold text-gray-300">
								{props.total_auditions} Agents
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SeasonOverviewCard;

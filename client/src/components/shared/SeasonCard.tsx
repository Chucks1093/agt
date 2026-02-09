import { Bot, MoveRight } from 'lucide-react';
import type { SeasonStatus } from '@shared/season.types';
import { SeasonStatusBadge } from './StatusBadge';
import { Link } from 'react-router';

export interface Season {
	id: string;

	title: string;
	description: string;
	status: SeasonStatus;
	cover_image_url: string;

	// Prize info
	prize_pool_agt: number; // Total prize in $AGT
	prize_pool_usdc?: number; // Optional USDC prize

	episode_2_participants: number; // Top N advance to finals (default: 12)

	// Counts
	total_auditions: number;

	created_at: Date;
	updated_at: Date;
}

interface SeasonCardProps extends Season {
	key?: string;
}

const SeasonCard = (props: SeasonCardProps) => {
	const isNotActive =
		props.status == 'UPCOMING' || props.status == 'COMPLETED';
	return (
		<div
			rel="noopener noreferrer"
			className={`rounded-3xl border border-gray-200 p-2 overflow-hidden shadow-sm hover:shadow-md transition-all bg-white relative ${isNotActive && 'opacity-50'}`}
		>
			{/* Image Container */}
			<div className="md:h-[16rem] h-[13rem] relative overflow-hidden rounded-3xl">
				{/* Cover Image */}
				<img
					src={props.cover_image_url}
					alt={props.title}
					className="w-full h-full object-cover object-top brightness-90"
					onError={e => {
						e.currentTarget.src =
							'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="18"%3ESeason Image%3C/text%3E%3C/svg%3E';
					}}
				/>
				<SeasonStatusBadge
					status={props.status}
					className="absolute top-3 right-3"
				/>
			</div>

			{/* Content */}
			<div className="p-4">
				{/* Title */}
				<h3 className="text-xl font-semibold font-manrope text-gray-600 mb-3 overflow-hidden line-clamp-2">
					{props.title}
				</h3>

				{/* Description */}
				<p className="text-gray-400 line-clamp-2 text-sm">
					{props.description}
				</p>
				<div className="border-t-2 mt-4 py-2 border-gray-200 border-dashed flex items-center justify-between">
					<div className="flex items-center  py-2 gap-1 ">
						<img
							src="/icons/trophy.svg"
							className="size-5 text-gray-700"
							alt=""
						/>
						<p className="font-manrope font-bold text-gray-500">
							{props.prize_pool_agt} $AGT
						</p>
					</div>
					<div className="flex items-center  py-2 gap-1">
						<Bot className="size-6 text-gray-500" />
						<p className="font-manrope font-bold text-gray-500">
							{props.total_auditions} Agents
						</p>
					</div>
				</div>
				<Link
					to={`/seasons/${props.id}`}
					className="bg-gray-800 hover:bg-gray-700 active:bg-gray-700 disabled:bg-gray-700 mt-3 disabled:cursor-not-allowed text-white font-semibold font-jakarta px-14 py-2.5 rounded-lg transition-colors duration-200 outline-none ring-2 ring-gray-500 ring-offset-2 cursor-pointer w-full flex items-center gap-3 justify-center"
				>
					View Details <MoveRight />
				</Link>
			</div>
		</div>
	);
};

export default SeasonCard;

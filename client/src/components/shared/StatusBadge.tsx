import type { SeasonStatus } from '@shared/season.types';

export const SeasonStatusBadge = (props: {
	status: SeasonStatus;
	className?: string;
}) => {
	const getStatusConfig = (status: SeasonStatus) => {
		switch (status) {
			case 'UPCOMING':
				return {
					label: 'Coming Soon',
					color: 'bg-blue-100 text-blue-700 border-blue-200',
					dotColor: 'bg-gray-500',
				};
			case 'AUDITIONS_OPEN':
				return {
					label: 'Auditions Open',
					color: 'bg-green-100 text-green-700 border-green-200',
					dotColor: 'bg-green-500 animate-pulse',
				};
			case 'AUDITIONS_CLOSED':
				return {
					label: 'Auditions Closed',
					color: 'bg-orange-100 text-orange-700 border-orange-200',
					dotColor: 'bg-orange-500',
				};
			case 'EPISODE_1':
				return {
					label: 'Live: Episode 1',
					color: 'bg-red-100 text-red-700 border-red-200',
					dotColor: 'bg-red-500 animate-pulse',
				};
			case 'VOTING':
				return {
					label: 'Voting Open',
					color: 'bg-purple-100 text-purple-700 border-purple-200',
					dotColor: 'bg-purple-500 animate-pulse',
				};
			case 'EPISODE_2':
				return {
					label: 'Live: Finals',
					color: 'bg-red-100 text-red-700 border-red-200',
					dotColor: 'bg-red-500 animate-pulse',
				};
			case 'COMPLETED':
				return {
					label: 'Completed',
					color: 'bg-gray-100 text-gray-700 border-gray-200',
					dotColor: 'bg-gray-500',
				};
			default:
				return {
					label: status,
					color: 'bg-gray-100 text-gray-700 border-gray-200',
					dotColor: 'bg-gray-500',
				};
		}
	};

	const statusConfig = getStatusConfig(props.status);
	return (
		<div className={props.className}>
			<div
				className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm  bg-white border-none text-gray-600`}
			>
				<div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
				<span className="text-xs font-medium">{statusConfig.label}</span>
			</div>
		</div>
	);
};

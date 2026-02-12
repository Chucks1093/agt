import { TabsContent } from '../ui/tabs';
import { Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import CircularSpinner from '../common/CircularSpinnerProps';
import EmptyState from '../common/EmptyState';
import SeasonJudgeCard from './SeasonJudgeCard';

import type { SeasonJudge } from '@shared/season.types';
import { seasonService } from '@/services/season.service';

const SeasonJudgesTab: React.FC<{ seasonId: string }> = ({ seasonId }) => {
	const {
		data: judgesData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['seasonJudges', seasonId],
		queryFn: () => seasonService.getJudgesBySeason(seasonId),
		enabled: Boolean(seasonId),
	});

	const seasonJudges: SeasonJudge[] = judgesData ?? [];

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<CircularSpinner color="#157EDBFF" size={50} />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-600">
					{error instanceof Error
						? error.message
						: 'Failed to load judges'}
				</p>
			</div>
		);
	}

	return (
		<TabsContent value="judges" className="bg-white p-4">
			{seasonJudges.length === 0 ? (
				<EmptyState
					icon={Bot}
					title="No judges yet"
					description="No agent has been assigned as a judge for this season."
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{seasonJudges.map(judge => (
						<SeasonJudgeCard key={judge.id} {...judge} />
					))}
				</div>
			)}
		</TabsContent>
	);
};

export default SeasonJudgesTab;

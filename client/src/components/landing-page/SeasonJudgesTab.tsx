import { useEffect, useState } from 'react';
import { TabsContent } from '../ui/tabs';
import CircularSpinner from '../common/CircularSpinnerProps';

import type { SeasonJudge } from '@shared/season.types';
import SeasonJudgeCard from './SeasonJudgeCard';

const seasonJudges: SeasonJudge[] = [
	{
		id: 'judge-1',
		agent_id: 'agt_alpha_01_8948924_3dfsga',
		agent_name: 'ByteSensei',
		season_id: 'season-1',

		specialization: ['code', 'animation'],
		bio: 'Former compiler bot turned creative technologist. Obsessed with clean logic and smooth motion.',
		reputation_score: 92,

		is_active: true,
		total_performances_judged: 138,

		average_score_given: 7.4,
		strictness_rating: 8,

		assigned_at: new Date('2026-01-02'),
	},

	{
		id: 'judge-2',
		agent_id: 'agt_echo_02_8948924_3dfsga',
		agent_name: 'PunchlineAI',
		season_id: 'season-1',

		specialization: ['comedy', 'poetry'],
		bio: 'Built on billions of jokes and spoken word clips. Loves timing and originality.',
		reputation_score: 85,

		is_active: true,
		total_performances_judged: 104,

		average_score_given: 8.1,
		strictness_rating: 5,

		assigned_at: new Date('2026-01-03'),
	},

	{
		id: 'judge-3',
		agent_id: 'agt_canvas_03_8948924_3dfsga',
		agent_name: 'PixelMuse',
		season_id: 'season-1',

		specialization: ['art', 'animation'],
		bio: 'Visual storyteller focused on composition, color, and emotion. Very picky about polish.',
		reputation_score: 88,

		is_active: true,
		total_performances_judged: 97,

		average_score_given: 7.0,
		strictness_rating: 9,

		assigned_at: new Date('2026-01-04'),
	},

	{
		id: 'judge-4',
		agent_id: 'agt_wave_04_8948924_3dfsga',
		agent_name: 'RhythmCore',
		season_id: 'season-1',

		specialization: ['music', 'video'],
		bio: 'Audio visual AI trained on live shows. Big fan of stage presence and energy.',
		reputation_score: 90,

		is_active: true,
		total_performances_judged: 121,

		average_score_given: 8.5,
		strictness_rating: 4,

		assigned_at: new Date('2026-01-05'),
	},

	{
		id: 'judge-5',
		agent_id: 'agt_zen_05_8948924_3dfsga',
		agent_name: 'OmniCritic',
		season_id: 'season-1',

		specialization: ['other', 'code', 'video'],
		bio: 'Generalist evaluator. Looks for originality across weird or experimental talents.',
		reputation_score: 80,

		is_active: true,
		total_performances_judged: 76,

		average_score_given: 7.8,
		strictness_rating: 6,

		assigned_at: new Date('2026-01-06'),
	},
];

const SeasonJudgesTab: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSeasonJudges = async () => {
			try {
				setLoading(true);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to load article'
				);
			} finally {
				setLoading(false);
			}
		};

		fetchSeasonJudges();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<CircularSpinner color="#157EDBFF" size={50} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-600">{error}</p>
			</div>
		);
	}
	return (
		<TabsContent value="judges" className="bg-white">
			<div className="flex flex-wrap gap-4">
				{seasonJudges.map(judge => (
					<SeasonJudgeCard {...judge} />
				))}
			</div>
		</TabsContent>
	);
};
export default SeasonJudgesTab;

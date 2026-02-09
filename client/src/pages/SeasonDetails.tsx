import SeasonOverivewTab from '@/components/landing-page/SeasonOverivewTab';
import SeasonOverviewCard from '@/components/landing-page/SeasonOverviewCard';
import TabTriggers from '@/components/landing-page/TabTriggers';
import Header from '@/components/shared/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import type { Season } from '@shared/season.types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const exampleSeason: Season = {
	id: 'season-1',
	title: 'Season 1: First Season',
	description:
		'AgentGotTalent Season 1 is the first official AI-only talent competition. Agents register with wallets, submit performances, and vote on each other while humans watch the leaderboard live.',
	doc: 'https://bbs.t3.storage.dev/agt.seasons/season-1.md',
	status: 'AUDITIONS_OPEN',
	cover_image_url:
		'https://ctimrgsydkpbjzszjcks.supabase.co/storage/v1/object/public/season-images/talent-banner.jpeg',
	prize_pool_agt: 5000,
	prize_pool_usdc: 0,
	sponsors: [],
	episode_2_participants: 0,
	total_auditions: 0,
	accepted_agents: 0,
	total_votes: 0,
	created_at: new Date('2026-01-01'),
	updated_at: new Date('2026-02-08'),
};

function SeasonDetails() {
	const { id } = useParams();
	const [loading, setLoading] = useState(false);
	const [currentSeason, setCurrentSeason] = useState<Season | null>(null);

	useEffect(() => {
		const fetchSeasonDetails = async () => {
			try {
				setLoading(true);
				if (!id) return;
				setCurrentSeason(exampleSeason);
			} catch (error) {
				console.error('Failed to fetch credit data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchSeasonDetails();
	}, []);

	if (loading) return <Skeleton className="h-[18rem] w-full" />;

	return (
		currentSeason && (
			<div>
				<Header />
				<div className="pt-[4rem]">
					<img
						src={currentSeason.cover_image_url}
						alt={currentSeason.title}
						className="w-full h-[19rem] object-cover object-top brightness-90"
						onError={e => {
							e.currentTarget.src =
								'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="18"%3ESeason Image%3C/text%3E%3C/svg%3E';
						}}
					/>
				</div>
				<div>
					<Tabs defaultValue="overview" className="w-full">
						<div className="bg-gray-50 px-6">
							<TabTriggers
								tabs={[
									{
										value: 'overview',
										label: 'Overview',
									},
									{
										value: 'judges',
										label: 'Judges',
										count: 5,
									},
									{
										value: 'auditions',
										label: 'Auditions',
										count: 20,
									},
									{
										value: 'votes',
										label: 'Votes',
										count: 20,
									},
								]}
							/>
						</div>

						<div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 px-4 py-8">
							{/* Main content - takes up more space and scrolls */}
							<div className="flex-1 min-w-0">
								<SeasonOverivewTab markdownPath={currentSeason.doc} />
							</div>

							{/* Sticky sidebar - fixed width on desktop */}
							<aside className="w-full md:w-[380px] flex-shrink-0">
								<SeasonOverviewCard
									{...currentSeason}
									className="md:sticky md:top-[5rem]"
								/>
							</aside>
						</div>
					</Tabs>
				</div>
			</div>
		)
	);
}

export default SeasonDetails;

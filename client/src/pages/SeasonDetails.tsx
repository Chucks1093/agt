import SeasonAuditionsTab from '@/components/landing-page/SeasonAuditionsTab';
import SeasonJudgesTab from '@/components/landing-page/SeasonJudgesTab';
import SeasonOverivewTab from '@/components/landing-page/SeasonOverivewTab';
import SeasonOverviewCard from '@/components/landing-page/SeasonOverviewCard';
import SeasonPerformanceTab from '@/components/landing-page/SeasonPerformanceTab';
import TabTriggers from '@/components/landing-page/TabTriggers';
import Header from '@/components/shared/Header';
import { Tabs } from '@/components/ui/tabs';
import type { Season } from '@shared/season.types';
import { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';

function SeasonDetails() {
	const currentSeason = useLoaderData() as Season;
	const [currentTab, setCurrentTab] = useState('overview');

	const showOverviewCard = useMemo(
		() => currentTab === 'overview' || currentTab === 'judge',
		[currentTab]
	);

	return (
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
				<Tabs
					defaultValue="overview"
					className="w-full"
					onValueChange={tab => setCurrentTab(tab)}
				>
					<div className="bg-gray-50 px-6">
						<TabTriggers
							tabs={[
								{ value: 'overview', label: 'Overview' },
								{
									value: 'judges',
									label: 'Judges',
									count: currentSeason.total_judges,
								},
								{
									value: 'auditions',
									label: 'Auditions',
									count: currentSeason.total_auditions,
								},
								{
									value: 'votes',
									label: 'Votes',
									count: currentSeason.total_votes,
								},
								{ value: 'performance', label: 'Performances' },
								{ value: 'leaderboard', label: 'Leaderboard' },
							]}
						/>
					</div>

					<div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 px-4 py-8 justify-between  w-full">
						<div className="flex-1 min-w-0">
							<SeasonOverivewTab markdownPath={currentSeason.doc} />
							<SeasonJudgesTab />
							<SeasonAuditionsTab />
							<SeasonPerformanceTab />
						</div>

						{showOverviewCard && (
							<aside className="w-full md:w-[380px] flex-shrink-0">
								<SeasonOverviewCard
									{...currentSeason}
									className="md:sticky md:top-[5rem]"
								/>
							</aside>
						)}
					</div>
				</Tabs>
			</div>
		</div>
	);
}

export default SeasonDetails;

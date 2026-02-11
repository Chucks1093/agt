"use client";

import { Container } from "@/components/Container";

export default function LeaderboardPage() {
	return (
		<Container
			title='Leaderboard'
			subtitle='Live read from the contest contract.'>
			<div className='rounded-lg border border-border bg-card p-6'>
				<div className='text-sm text-muted-foreground'>Submissions</div>
			</div>
		</Container>
	);
}

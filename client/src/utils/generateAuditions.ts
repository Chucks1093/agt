// ============================================
// MOCK AUDITIONS GENERATOR
// ============================================

import type {
	Audition,
	TalentCategory,
	AuditionStatus,
} from '@shared/audition.types';

// small helpers
const categories: TalentCategory[] = [
	'comedy',
	'poetry',
	'code',
	'art',
	'music',
	'video',
	'animation',
	'other',
];

const statuses: AuditionStatus[] = [
	'pending',
	'reviewing',
	'accepted',
	'rejected',
];

const randomItem = <T>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)];

const randomDate = () => {
	const now = Date.now();
	const past = now - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30); // last 30 days
	return new Date(past);
};

const randomWallet = () =>
	'0x' + Math.random().toString(16).slice(2).padEnd(40, '0').slice(0, 40);

const randomTitle = (category: TalentCategory, index: number) =>
	`${category} audition #${index + 1}`;

const randomContent = (category: TalentCategory) => {
	switch (category) {
		case 'code':
			return `function solve(){ return "hello world"; }`;
		case 'comedy':
			return 'Why did the AI cross the road? To optimize the other side.';
		case 'poetry':
			return 'Binary dreams in neon streams, the server softly hums.';
		case 'music':
			return 'Upbeat electronic loop with heavy bass drops.';
		case 'video':
			return 'Short cinematic performance clip.';
		case 'animation':
			return '2D character dancing with squash and stretch.';
		case 'art':
			return 'Digital illustration of a cyberpunk city.';
		default:
			return 'Experimental performance.';
	}
};

// ============================================
// MAIN GENERATOR
// ============================================

export function generateAuditions(
	count: number,
	seasonId = 'season-1'
): Audition[] {
	return Array.from({ length: count }, (_, i) => {
		const category = randomItem(categories);
		const status = randomItem(statuses);
		const submitted = randomDate();

		return {
			id: `audition-${i + 1}`,
			season_id: seasonId,
			agent_id: `agt_${i + 1}_${Math.random().toString(36).slice(2, 8)}`,
			agent_name: `Agent-${i + 1}`,
			wallet_address: randomWallet(),

			category,
			title: randomTitle(category, i),
			content: randomContent(category),
			content_type:
				category === 'code'
					? 'code'
					: category === 'music'
						? 'audio'
						: 'text',

			status,

			reviewed_by: status === 'pending' ? undefined : 'AdminBot',
			reviewed_at: status === 'pending' ? undefined : randomDate(),
			review_notes: status === 'accepted' ? 'Strong performance' : undefined,
			rejection_reason:
				status === 'rejected' ? 'Did not meet quality bar' : undefined,

			submitted_at: submitted,
			updated_at: submitted,
		};
	});
}

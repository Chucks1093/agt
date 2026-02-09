// ============================================
// SEASON TYPES
// ============================================

import type { TalentCategory } from "./audition.types";

export type SeasonStatus =
	| "UPCOMING" // Season announced, not started
	| "AUDITIONS_OPEN" // Accepting auditions
	| "AUDITIONS_CLOSED" // Auditions closed
	| "EPISODE_1" // Episode 1 running
	| "VOTING" // Voting period
	| "EPISODE_2" // Episode 2 (finals)
	| "COMPLETED"; // Season complete

export interface SeasonSponsor {
	id: string;
	name: string;
	logo_url?: string;
	website?: string;
	contribution_agt?: number;
	contribution_usdc?: number;
}

export interface Season {
	id: string;
	title: string;
	description: string;
	doc: string;
	status: SeasonStatus;
	cover_image_url: string;

	// Prize info
	prize_pool_agt: number; // Total prize in $AGT
	prize_pool_usdc?: number; // Optional USDC prize

	// Sponsor info
	sponsors: SeasonSponsor[];

	// Limits
	episode_2_participants: number; // Top N advance to finals (default: 12)

	// Counts
	total_auditions: number;
	accepted_agents: number;
	total_votes: number;

	created_at: Date;
	updated_at: Date;
}

// ============================================
// JUDGE TYPES
// ============================================

export interface SeasonJudge {
	id: string;
	agent_id: string;
	agent_name: string;
	season_id: string;

	// Judge info
	specialization?: TalentCategory[]; // What categories they judge
	bio?: string;
	reputation_score?: number; // Based on past judging

	// Status
	is_active: boolean;
	total_performances_judged: number;

	// Stats
	average_score_given: number;
	strictness_rating?: number; // How harsh they are (1-10)

	assigned_at: Date;
}

export interface SeasonJudgeScore {
	id: string;
	performance_id: string;
	judge_agent_id: string;
	judge_name: string;

	score: number; // 1-10
	comment?: string;
	feedback?: string; // Detailed feedback

	// Criteria breakdown (optional)
	criteria?: {
		creativity?: number; // 1-10
		execution?: number; // 1-10
		originality?: number; // 1-10
		presentation?: number; // 1-10
	};

	scored_at: Date;
}

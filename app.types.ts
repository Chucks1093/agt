export type AgentRole = "PARTICIPANT" | "ADMIN" | "SUPER_ADMIN";
// ============================================
// AGENT TYPES
// ============================================

export interface Agent {
	id: string;
	wallet_address: string;
	name: string;
	bio?: string;
	avatar_url?: string;
	role: AgentRole; // Agent can have multiple roles
	api_key?: string; // For agent authentication
	webhook_url?: string; // For notifications
	created_at: Date;
	updated_at: Date;
	last_active?: Date;

	// Stats
	total_competitions: number;
	total_wins: number;
	total_prize_money: number;
	average_score?: number;

	// Metadata
	metadata?: {
		twitter_handle?: string;
		moltbook_handle?: string;
		website?: string;
		framework?: string; // 'openclaw', 'langchain', etc.
		model?: string;
	};
}

// ============================================
// SEASON TYPES
// ============================================

export type SeasonStatus =
	| "announced" // Season announced, not started
	| "auditions_open" // Accepting auditions
	| "auditions_closed" // Auditions closed
	| "episode_1" // Episode 1 running
	| "voting" // Voting period
	| "episode_2" // Episode 2 (finals)
	| "completed"; // Season complete

export interface Sponsor {
	id: string;
	name: string;
	logo_url?: string;
	website?: string;
	contribution_agt?: number;
	contribution_usdc?: number;
}

export interface Season {
	id: string;
	season_number: number;
	title: string;
	description?: string;
	status: SeasonStatus;

	// Timeline
	announcement_date: Date;
	auditions_start: Date;
	auditions_end: Date;
	episode_1_date: Date;
	voting_start: Date;
	voting_end: Date;
	episode_2_date: Date;
	completion_date?: Date;

	// Prize info
	prize_pool_agt: number; // Total prize in $AGT
	prize_pool_usdc?: number; // Optional USDC prize

	prize_distribution: {
		first: number; // Percentage
		second: number;
		third: number;
	};

	// Sponsor info
	sponsors: Sponsor[];

	// Limits
	max_participants: number;
	min_participants: number;
	episode_2_participants: number; // Top N advance to finals (default: 12)

	// Counts
	total_auditions: number;
	accepted_agents: number;
	total_votes: number;
	total_viewers: number;

	created_at: Date;
	updated_at: Date;
}

// ============================================
// AUDITION TYPES
// ============================================

export type TalentCategory =
	| "comedy"
	| "poetry"
	| "code"
	| "art"
	| "music"
	| "video"
	| "animation"
	| "other";

export type AuditionStatus =
	| "pending" // Waiting for review
	| "reviewing" // Admin is reviewing
	| "accepted" // Accepted into season
	| "rejected"; // Rejected

export interface Audition {
	id: string;
	season_id: string;
	agent_id: string;
	agent_name: string;
	wallet_address: string;

	// Audition content
	category: TalentCategory;
	title: string;
	content: string; // The actual audition (joke, code, etc.)
	content_type: "text" | "image" | "video" | "code" | "audio";
	content_url?: string; // If hosted externally

	// Status
	status: AuditionStatus;

	// Review
	reviewed_by?: string; // Admin agent name
	reviewed_at?: Date;
	review_notes?: string;
	rejection_reason?: string;

	// Metadata
	submitted_at: Date;
	updated_at: Date;
}

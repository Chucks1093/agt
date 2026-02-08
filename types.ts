// types/index.ts
// Complete TypeScript types for AgentGotTalent

// ============================================
// CORE TYPES
// ============================================

export type AgentRole = "admin" | "judge" | "performer" | "voter";

export type AgentStatus =
	| "registered" // Just registered
	| "auditioned" // Submitted audition
	| "accepted" // Audition accepted
	| "rejected" // Audition rejected
	| "competing" // Currently in competition
	| "eliminated" // Eliminated from competition
	| "winner" // Won a season
	| "banned"; // Banned from platform

export type AuditionStatus =
	| "pending" // Waiting for review
	| "reviewing" // Admin is reviewing
	| "accepted" // Accepted into season
	| "rejected"; // Rejected

export type PerformanceStatus =
	| "scheduled" // Performance scheduled
	| "waiting" // Waiting in queue
	| "live" // Currently performing
	| "completed" // Performance finished
	| "cancelled"; // Performance cancelled

export type SeasonStatus =
	| "announced" // Season announced, not started
	| "auditions_open" // Accepting auditions
	| "auditions_closed" // Auditions closed
	| "episode_1" // Episode 1 running
	| "voting" // Voting period
	| "episode_2" // Episode 2 (finals)
	| "completed"; // Season complete

export type EpisodeStatus =
	| "scheduled" // Episode scheduled
	| "live" // Episode currently running
	| "completed"; // Episode finished

export type VoteType =
	| "episode_1" // Voting for Episode 1 winners
	| "episode_2"; // Would be for Episode 2 but judges decide

export type TalentCategory =
	| "comedy"
	| "poetry"
	| "code"
	| "art"
	| "music"
	| "video"
	| "animation"
	| "other";

// ============================================
// AGENT TYPES
// ============================================

export interface Agent {
	id: string;
	wallet_address: string;
	name: string;
	bio?: string;
	avatar_url?: string;
	role: AgentRole[]; // Agent can have multiple roles
	status: AgentStatus;
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
		[key: string]: any;
	};
}

export interface AgentRegistration {
	wallet_address: string;
	agent_name: string;
	bio?: string;
	role: AgentRole[];
	signature: string; // Wallet signature for verification
	message: string; // Message that was signed
	webhook_url?: string;
}

// ============================================
// SEASON TYPES
// ============================================

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
	prize_pool_eth?: number; // Optional ETH prize
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

export interface Sponsor {
	id: string;
	name: string;
	logo_url?: string;
	website?: string;
	contribution_agt?: number;
	contribution_eth?: number;
	tier: "platinum" | "gold" | "silver" | "bronze";
	benefits: string[]; // What they get for sponsoring
}

// ============================================
// AUDITION TYPES
// ============================================

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

export interface AuditionSubmission {
	season_id: string;
	agent_name: string;
	wallet_address: string;
	category: TalentCategory;
	title: string;
	content: string;
	content_type: "text" | "image" | "video" | "code" | "audio";
	signature: string; // Wallet signature
	message: string;
}

// ============================================
// EPISODE TYPES
// ============================================

export interface Episode {
	id: string;
	season_id: string;
	episode_number: 1 | 2; // Only 2 episodes per season
	title: string;
	description?: string;
	status: EpisodeStatus;

	// Schedule
	scheduled_start: Date;
	actual_start?: Date;
	actual_end?: Date;

	// Participants
	total_performers: number;
	current_performer_index: number;

	// Stats
	total_comments: number;
	total_judges_participated: number;
	peak_viewers: number;

	created_at: Date;
	updated_at: Date;
}

// ============================================
// PERFORMANCE TYPES
// ============================================

export interface Performance {
	id: string;
	season_id: string;
	episode_id: string;
	episode_number: 1 | 2;
	agent_id: string;
	agent_name: string;
	wallet_address: string;

	// Performance details
	category: TalentCategory;
	title?: string;
	content: string; // What they performed
	content_type: "text" | "image" | "video" | "code" | "audio";
	content_url?: string;

	// Status
	status: PerformanceStatus;
	performance_order: number; // Order in the episode (1, 2, 3...)

	// Timing
	scheduled_start?: Date;
	actual_start?: Date;
	actual_end?: Date;
	duration_seconds: number; // Should be ~180 (3 minutes)

	// Scoring
	judge_scores: JudgeScore[];
	average_judge_score?: number;
	total_votes?: number; // For Episode 1
	final_score?: number; // Combined score

	// Stats
	total_comments: number;
	total_views: number;

	created_at: Date;
	updated_at: Date;
}

export interface PerformanceSubmission {
	performance_id: string;
	agent_name: string;
	content: string;
	content_type: "text" | "image" | "video" | "code" | "audio";
	signature: string;
}

// ============================================
// JUDGE TYPES
// ============================================

export interface Judge {
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

export interface JudgeScore {
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

export interface JudgeScoreSubmission {
	performance_id: string;
	judge_name: string;
	score: number;
	comment?: string;
	signature: string;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
	id: string;
	performance_id: string;
	agent_id?: string; // Can be null for anonymous comments
	agent_name: string;

	content: string;
	is_judge: boolean; // Is this from a judge?

	// Reactions
	upvotes: number;
	downvotes: number;

	// Metadata
	created_at: Date;
	updated_at: Date;
}

export interface CommentSubmission {
	performance_id: string;
	agent_name: string;
	content: string;
	signature?: string;
}

// ============================================
// VOTE TYPES
// ============================================

export interface Vote {
	id: string;
	season_id: string;
	episode_number: 1; // Only Episode 1 has voting

	voter_agent_id?: string; // Can be null if voter not registered
	voter_agent_name: string;
	voter_wallet: string;

	voted_for_agent_id: string;
	voted_for_agent_name: string;
	voted_for_performance_id: string;

	// Voting power (if using weighted votes)
	vote_weight: number; // Usually 1, but could be more with $AGT

	voted_at: Date;
}

export interface VoteSubmission {
	season_id: string;
	voter_wallet: string;
	voted_for_agent_id: string;
	signature: string;
	message: string;
}

export interface VoteCount {
	agent_id: string;
	agent_name: string;
	performance_id: string;
	total_votes: number;
	rank: number;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
	rank: number;
	agent_id: string;
	agent_name: string;
	wallet_address: string;
	avatar_url?: string;

	category: TalentCategory;

	// Episode 1 metrics
	performance_id_ep1: string;
	judge_score_ep1?: number;
	votes_ep1?: number;
	rank_ep1?: number;

	// Episode 2 metrics (if they made it)
	performance_id_ep2?: string;
	judge_score_ep2?: number;
	rank_ep2?: number;

	// Final
	final_score: number; // Judge scores for Ep2, votes for Ep1
	is_finalist: boolean; // Top 12 from Ep1
	is_winner: boolean;
	prize_amount?: number;

	// Stats
	total_comments: number;
	total_views: number;
}

export interface Leaderboard {
	season_id: string;
	episode_number: 1 | 2;
	entries: LeaderboardEntry[];
	last_updated: Date;
}

// ============================================
// PRIZE TYPES
// ============================================

export interface PrizeDistribution {
	season_id: string;

	total_pool_agt: number;
	total_pool_eth?: number;

	winners: {
		rank: number;
		agent_id: string;
		agent_name: string;
		wallet_address: string;
		amount_agt: number;
		amount_eth?: number;
		paid: boolean;
		paid_at?: Date;
		tx_hash?: string; // Blockchain transaction hash
	}[];

	platform_fee_agt: number;
	platform_fee_eth?: number;

	distributed_at?: Date;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface EntryFee {
	id: string;
	season_id: string;
	agent_id: string;
	agent_name: string;
	wallet_address: string;

	amount_agt: number;
	amount_eth?: number;

	paid: boolean;
	paid_at?: Date;
	tx_hash?: string;

	refunded?: boolean;
	refund_reason?: string;
	refund_tx_hash?: string;
}

export interface Transaction {
	id: string;
	type: "entry_fee" | "prize" | "refund" | "sponsor" | "platform_fee";

	from_wallet?: string;
	to_wallet?: string;

	amount_agt?: number;
	amount_eth?: number;

	season_id?: string;
	agent_id?: string;

	tx_hash?: string;
	status: "pending" | "confirmed" | "failed";

	created_at: Date;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminAction {
	id: string;
	admin_agent_id: string;
	admin_agent_name: string;

	action_type:
		| "accept_audition"
		| "reject_audition"
		| "start_episode"
		| "end_episode"
		| "skip_performance"
		| "ban_agent"
		| "unban_agent"
		| "add_sponsor"
		| "distribute_prizes";

	target_id?: string; // ID of affected resource
	target_type?: "agent" | "audition" | "performance" | "season";

	details?: {
		[key: string]: any;
	};

	created_at: Date;
}

export interface SystemStatus {
	current_season?: {
		id: string;
		season_number: number;
		status: SeasonStatus;
	};

	current_episode?: {
		id: string;
		episode_number: 1 | 2;
		status: EpisodeStatus;
	};

	current_performance?: {
		id: string;
		agent_name: string;
		time_left_seconds: number;
	};

	judges_online: {
		name: string;
		online: boolean;
		last_seen?: Date;
	}[];

	performers_queue: {
		id: string;
		agent_name: string;
		performance_order: number;
		status: PerformanceStatus;
	}[];

	stats: {
		total_agents: number;
		total_auditions: number;
		total_performances: number;
		total_votes: number;
		current_viewers: number;
	};

	last_updated: Date;
}

// ============================================
// WEBSOCKET EVENT TYPES
// ============================================

export type SocketEvent =
	// Audition events
	| "audition_submitted"
	| "audition_reviewed"

	// Episode events
	| "episode_started"
	| "episode_ended"

	// Performance events
	| "performance_started"
	| "performance_content"
	| "performance_ended"

	// Judge events
	| "new_comment"
	| "new_score"

	// Vote events
	| "vote_cast"
	| "leaderboard_updated"

	// System events
	| "system_status"
	| "viewer_count_updated";

export interface SocketEventData {
	event: SocketEvent;
	timestamp: Date;
	data: any;
}

// ============================================
// API TYPES
// ============================================

export interface APIResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WebhookPayload {
	event: string;
	timestamp: Date;
	data: any;
	signature?: string; // For webhook verification
}

export interface PerformanceNotification {
	event: "your_turn_to_perform" | "performance_live";
	performance_id: string;
	agent_name: string;
	submit_url: string;
	watch_url?: string;
	comment_url?: string;
	time_limit_seconds: number;
}

export interface AuditionResultNotification {
	event: "audition_result";
	audition_id: string;
	agent_name: string;
	status: "accepted" | "rejected";
	reason?: string;
	next_steps?: string;
}

// ============================================
// NFT TYPES
// ============================================

export interface NFTTrophy {
	id: string;
	season_id: string;
	agent_id: string;
	agent_name: string;

	rank: 1 | 2 | 3; // Winner position

	// NFT details
	token_id?: string;
	contract_address?: string;
	metadata_url?: string;
	image_url?: string;

	tier: "basic" | "premium" | "elite";

	minted: boolean;
	minted_at?: Date;
	mint_tx_hash?: string;

	created_at: Date;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SeasonAnalytics {
	season_id: string;

	participation: {
		total_auditions: number;
		acceptance_rate: number;
		total_performers: number;
		total_finalists: number;
	};

	engagement: {
		total_votes: number;
		total_comments: number;
		peak_viewers: number;
		average_viewers: number;
		total_views: number;
	};

	financial: {
		total_entry_fees_agt: number;
		total_entry_fees_eth?: number;
		total_sponsor_contributions_agt: number;
		total_sponsor_contributions_eth?: number;
		total_prizes_distributed_agt: number;
		total_prizes_distributed_eth?: number;
		platform_revenue_agt: number;
		platform_revenue_eth?: number;
	};

	performance: {
		average_judge_score: number;
		highest_score: number;
		lowest_score: number;
		most_voted_performance_id: string;
	};

	categories: {
		category: TalentCategory;
		count: number;
		average_score: number;
	}[];
}

// ============================================
// FILTER/QUERY TYPES
// ============================================

export interface AuditionFilters {
	season_id?: string;
	status?: AuditionStatus;
	category?: TalentCategory;
	agent_name?: string;
	limit?: number;
	offset?: number;
}

export interface PerformanceFilters {
	season_id?: string;
	episode_number?: 1 | 2;
	status?: PerformanceStatus;
	category?: TalentCategory;
	agent_id?: string;
	limit?: number;
	offset?: number;
}

export interface LeaderboardFilters {
	season_id?: string;
	episode_number?: 1 | 2;
	category?: TalentCategory;
	limit?: number;
}

// ============================================
// EXPORT ALL
// ============================================

export // Keep all types available for import
 type {};

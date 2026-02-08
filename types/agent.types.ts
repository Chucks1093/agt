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

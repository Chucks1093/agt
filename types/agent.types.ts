// ============================================
// AGENT TYPES (shared server/client)
// ============================================

export type AgentRole = "PARTICIPANT" | "ADMIN" | "SUPER_ADMIN";

// NOTE: MVP shape matches current agents table + API responses.
// Future fields are optional for forward-compat.
export interface Agent {
	id: string;
	wallet_address: string;
	name: string;
	description?: string | null;
	website?: string | null;
	created_at: string;

	// Optional / future fields
	bio?: string;
	avatar_url?: string;
	role?: AgentRole;
	webhook_url?: string;
	updated_at?: string;
	last_active?: string;

	// Stats (future)
	total_competitions: number;
	total_wins: number;
	total_prize_money: number;
	average_score: number;

	// Metadata (future)
	metadata: {
		twitter_handle: string;
		moltbook_handle: string;
		website: string;
		framework: string; // 'openclaw', 'langchain', etc.
		model: string;
	};
}

// ============================================
// AGENT SESSION + INTENTS
// ============================================

export type AgentIntentStatus = "pending" | "completed" | "expired";

export interface AgentIntent {
	id: string;
	status: AgentIntentStatus;
	created_at: string;
	expires_at: string;
	agent: {
		id: string;
		wallet_address: string;
		name: string;
	} | null;
}

export interface AgentChallenge {
	address: string;
	nonce: string;
	message: string;
	created_at: string;
	expires_at: string;
}

export interface AgentSessionResponse {
	token: string;
	address: string;
}

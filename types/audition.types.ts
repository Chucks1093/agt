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

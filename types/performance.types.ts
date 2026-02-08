// ============================================
// PERFORMANCE TYPES
// ============================================
import { TalentCategory } from "./audition.types";
import { SeasonJudgeScore } from "./season.types";

export type PerformanceStatus =
	| "scheduled" // Performance scheduled
	| "waiting" // Waiting in queue
	| "live" // Currently performing
	| "completed" // Performance finished
	| "cancelled"; // Performance cancelled

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
	judge_scores: SeasonJudgeScore[];
	average_judge_score?: number;
	total_votes?: number; // For Episode 1
	final_score?: number; // Combined score

	// Stats
	total_comments: number;
	total_views: number;

	created_at: Date;
	updated_at: Date;
}

import type { Agent } from "@shared/agent.types";

export type AgentRow = {
	id: string;
	wallet_address: string;
	name: string;
	description: string | null;
	website: string | null;
	created_at: string;
};

export function shapeAgent(row: AgentRow): Agent {
	return {
		id: row.id,
		wallet_address: row.wallet_address,
		name: row.name,
		description: row.description ?? null,
		website: row.website ?? null,
		created_at: row.created_at,
	};
}

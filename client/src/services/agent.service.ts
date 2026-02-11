import { BaseApiService, ApiError, type APIResponse } from './api.service';
import type {
	Agent,
	AgentChallenge,
	AgentIntent,
	AgentSessionResponse,
} from '@shared/agent.types';

export type AgentSessionRequest = {
	address: string;
	signature: `0x${string}`;
};

export type AgentRegisterRequest = {
	name: string;
	description?: string | null;
	website?: string | null;
};

class AgentService extends BaseApiService {
	private unwrap<T>(payload: APIResponse<T>): T {
		if (!payload?.success) {
			throw new ApiError(payload?.message || 'Request failed', 400);
		}
		return payload.data;
	}

	// POST /api/agent/intents
	async createIntent(): Promise<AgentIntent> {
		try {
			const response = await this.api.post<
				APIResponse<{ intent: AgentIntent }>
			>('/api/agent/intents');
			return this.unwrap(response.data).intent;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// GET /api/agent/intents/:id
	async getIntent(id: string): Promise<AgentIntent> {
		try {
			const response = await this.api.get<
				APIResponse<{ intent: AgentIntent }>
			>(`/api/agent/intents/${id}`);
			return this.unwrap(response.data).intent;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// GET /api/agent/challenge?address=0x...
	async requestChallenge(address: string): Promise<AgentChallenge> {
		try {
			const response = await this.api.get<
				APIResponse<{ challenge: AgentChallenge }>
			>('/api/agent/challenge', { params: { address } });
			return this.unwrap(response.data).challenge;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// POST /api/agent/session
	async createSession(input: AgentSessionRequest): Promise<AgentSessionResponse> {
		try {
			const response = await this.api.post<
				APIResponse<{ token: string; address: string }>
			>('/api/agent/session', input);
			const data = this.unwrap(response.data);
			this.setAuthToken(data.token);
			return { token: data.token, address: data.address };
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// GET /api/agent/me
	async me(): Promise<Agent> {
		try {
			const response = await this.api.get<APIResponse<{ agent: Agent }>>(
				'/api/agent/me'
			);
			return this.unwrap(response.data).agent;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// POST /api/agent/register?intent=...
	async register(
		input: AgentRegisterRequest,
		intentId?: string
	): Promise<Agent> {
		try {
			const response = await this.api.post<
				APIResponse<{ agent: Agent }>
			>('/api/agent/register', input, {
				params: intentId ? { intent: intentId } : undefined,
			});
			return this.unwrap(response.data).agent;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	logout(): void {
		this.clearAuth();
	}
}

export const agentService = new AgentService();

import { BaseApiService, ApiError, type APIResponse } from './api.service';
import type { Audition } from '@shared/audition.types';

export type AuditionSubmitRequest = {
	season_id: string;
	agent_name: string;
	category: string;
	title: string;
	content: string;
	content_type: "text" | "image" | "video" | "code" | "audio";
	content_url?: string | null;
};

class AuditionService extends BaseApiService {
	private unwrap<T>(payload: APIResponse<T>): T {
		if (!payload?.success) {
			throw new ApiError(payload?.message || 'Request failed', 400);
		}
		return payload.data;
	}

	// GET /api/auditions?seasonId=...
	async getBySeason(seasonId: string): Promise<Audition[]> {
		try {
			const response = await this.api.get<APIResponse<{ auditions: Audition[] }>>(
				'/api/auditions',
				{ params: { seasonId } }
			);
			return this.unwrap(response.data).auditions;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// GET /api/auditions/:id
	async getById(id: string): Promise<Audition> {
		try {
			const response = await this.api.get<APIResponse<{ audition: Audition }>>(
				`/api/auditions/${id}`
			);
			return this.unwrap(response.data).audition;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// GET /api/auditions/me?seasonId=...
	async getMyAudition(seasonId: string): Promise<Audition> {
		try {
			const response = await this.api.get<APIResponse<{ audition: Audition }>>(
				'/api/auditions/me',
				{ params: { seasonId } }
			);
			return this.unwrap(response.data).audition;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// POST /api/auditions/apply
	async submitAudition(input: AuditionSubmitRequest): Promise<Audition> {
		try {
			const response = await this.api.post<APIResponse<{ audition: Audition }>>(
				'/api/auditions/apply',
				input
			);
			return this.unwrap(response.data).audition;
		} catch (error) {
			throw this.handleError(error);
		}
	}
}

export const auditionService = new AuditionService();

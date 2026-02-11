import { BaseApiService, ApiError, type APIResponse } from './api.service';
import type { Season } from '@shared/season.types';

class SeasonService extends BaseApiService {
	private unwrap<T>(payload: APIResponse<T>): T {
		if (!payload?.success) {
			throw new ApiError(payload?.message || 'Request failed', 400);
		}
		return payload.data;
	}

	// GET /api/seasons
	async getAll(): Promise<Season[]> {
		try {
			const response = await this.api.get<APIResponse<{ seasons: Season[] }>>(
				'/api/seasons'
			);
			return this.unwrap(response.data).seasons;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// GET /api/seasons/:id
	async getById(id: string): Promise<Season> {
		try {
			const response = await this.api.get<APIResponse<{ season: Season }>>(
				`/api/seasons/${id}`
			);
			return this.unwrap(response.data).season;
		} catch (error) {
			throw this.handleError(error);
		}
	}
}

export const seasonService = new SeasonService();

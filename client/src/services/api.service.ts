import { env } from '@/utils/env.utils';
import axios, { type AxiosInstance, AxiosError } from 'axios';

export interface APIResponse<T = undefined> {
	success: boolean;
	data: T;
	message: string;
}

export interface APIErrorResponse {
	success: false;
	message: string;
	code?: string;
	errors?: Array<{
		field?: string;
		message: string;
	}>;
}

export class ApiError extends Error {
	public status: number;
	public response?: APIErrorResponse;

	constructor(
		message: string,
		status: number = 500,
		response?: APIErrorResponse
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.response = response;
	}
}

// BASE CLASS - All services inherit from this
export class BaseApiService {
	protected api: AxiosInstance;
	protected API_URL: string;
	private ACCESS_TOKEN: string = 'agt_agent_token';

	constructor() {
		this.API_URL = env.VITE_BACKEND_URL;

		this.api = axios.create({
			baseURL: this.API_URL,
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		// Attach Bearer token when available
		this.api.interceptors.request.use(config => {
			const token = this.getAuthToken();
			if (token) {
				config.headers = config.headers ?? {};
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		// Clear auth on 401
		this.api.interceptors.response.use(
			response => response,
			error => {
				if (error?.response?.status === 401) {
					this.clearAuth();
				}
				return Promise.reject(error);
			}
		);
	}

	public setAuthToken(token: string): void {
		localStorage.setItem(this.ACCESS_TOKEN, token);
	}

	public getAuthToken(): string | null {
		return localStorage.getItem(this.ACCESS_TOKEN);
	}

	// Common error handler
	protected handleError(error: unknown): ApiError {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<APIErrorResponse>;

			if (axiosError.response) {
				const status = axiosError.response.status;
				const data = axiosError.response.data;
				const message = data?.message || 'An error occurred';

				return new ApiError(message, status, data);
			} else if (axiosError.request) {
				return new ApiError('Network error - check your connection', 0);
			}
		}

		if (error instanceof Error) {
			return new ApiError(error.message, 500);
		}

		return new ApiError('Something went wrong', 500);
	}

	// Override this in child classes if needed
	protected clearAuth(): void {
		localStorage.removeItem(this.ACCESS_TOKEN);
	}
}

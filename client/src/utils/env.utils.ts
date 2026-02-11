import { z } from 'zod';

const envSchema = z.object({
	VITE_BACKEND_URL: z.string(),
	VITE_WALLETCONNECT_PROJECT_ID: z.string().optional(),
	VITE_TARGET_CHAIN: z.enum(['anvil', 'baseSepolia']).optional(),
});

export const env = envSchema.parse(import.meta.env);

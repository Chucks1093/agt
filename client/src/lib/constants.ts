export const WAGMI_PROJECT_ID =
	(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ?? '';

export const TARGET_CHAIN =
	(import.meta.env.VITE_TARGET_CHAIN as 'anvil' | 'baseSepolia' | undefined) ??
	'anvil';

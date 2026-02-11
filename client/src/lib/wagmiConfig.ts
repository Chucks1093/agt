import { http, createConfig } from 'wagmi';
import { anvil, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';
import { TARGET_CHAIN, WAGMI_PROJECT_ID } from '@/lib/constants';

const chains = [anvil, baseSepolia] as const;

export const targetChainId =
	TARGET_CHAIN === 'baseSepolia' ? baseSepolia.id : anvil.id;

export const wagmiConfig = createConfig(
	getDefaultConfig({
		chains,
		transports: {
			[anvil.id]: http(anvil.rpcUrls.default.http[0]),
			[baseSepolia.id]: http('https://sepolia.base.org'),
		},
		walletConnectProjectId: WAGMI_PROJECT_ID,
		appName: 'AgentGotTalent',
		appDescription: 'The onchain talent show for AI agents.',
	})
);

declare module 'wagmi' {
	interface Register {
		config: typeof wagmiConfig;
	}
}

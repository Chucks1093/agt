import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import makeBlockie from 'ethereum-blockies-base64';
import { wagmiConfig } from '@/lib/wagmiConfig';

const queryClient = new QueryClient();

export interface ProvidersProps {
	children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider
					options={{
						customAvatar: ({ address, size }) => (
							<img
								src={makeBlockie(address || '')}
								width={size}
								height={size}
								className="rounded-full"
								alt="avatar"
							/>
						),
					}}
				>
					{children}
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}

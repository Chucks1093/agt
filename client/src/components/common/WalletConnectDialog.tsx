import { useMemo, useState } from 'react';
import { X, User, Bot, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomConnectButton } from '@/components/common/CustomConnectButton';
import { AgentStatusBadge } from '@/components/common/AgentStatusBadge';
import { RegisterAgentButton } from '@/components/common/RegisterAgentButton';
import { useAgentStore } from '@/hooks/useAgentStore';

export function WalletConnectDialog() {
	const [open, setOpen] = useState(false);
	const { address, isConnected } = useAccount();
	const agent = useAgentStore(s => s.agent);
	const isAgentConnected = !!agent;
	const isHumanConnected = isConnected && !!address && !agent;

	const shortAddress = useMemo(() => {
		if (!address) return '';
		return `${address.slice(0, 6)}…${address.slice(-4)}`;
	}, [address]);

	const handleResetDialog = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{isAgentConnected ? (
					<AgentStatusBadge />
				) : isHumanConnected ? (
					<CustomConnectButton className="bg-gray-700 text-white hover:bg-gray-600" />
				) : (
					<motion.button
						className="px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg text-sm font-semibold hover:from-gray-700 hover:to-gray-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Wallet className="w-4 h-4" />
						Connect Wallet
					</motion.button>
				)}
			</DialogTrigger>

			<DialogContent
				showCloseButton={false}
				className="sm:max-w-[560px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl bg-white"
			>
				<div className="w-full relative bg-gradient-to-br from-gray-50 to-white">
					<DialogHeader className="px-6 py-5 border-b border-gray-200 flex flex-row items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
								<Wallet className="w-5 h-5 text-white" />
							</div>
							<div>
								<DialogTitle className="text-xl font-semibold text-gray-800">
									Connect Wallet
								</DialogTitle>
								<p className="text-xs text-gray-500 mt-0.5">
									Choose how you want to connect
								</p>
							</div>
						</div>
						<DialogPrimitive.Close
							data-slot="dialog-close"
							className="flex items-center gap-2"
							onClick={handleResetDialog}
						>
							<button className="w-9 h-9 hover:bg-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer transition-colors rounded-full border border-gray-200">
								<X className="w-5 h-5 text-gray-600" />
							</button>
						</DialogPrimitive.Close>
					</DialogHeader>
				</div>

				<div className="px-6 pb-6">
					<Tabs defaultValue="human" className="w-full">
						<TabsList className="w-full grid grid-cols-2 !h-[3.5rem] bg-gray-100 p-1 rounded-xl">
							<TabsTrigger
								className="h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 font-medium"
								value="human"
							>
								<User className="w-4 h-4" />
								Human
							</TabsTrigger>
							<TabsTrigger
								className="h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 font-medium"
								value="agent"
							>
								<Bot className="w-4 h-4" />
								Agent
							</TabsTrigger>
						</TabsList>

						<TabsContent value="human" className="mt-6">
							<div className="flex flex-col items-center justify-center text-center gap-5 py-6">
								<div>
									<p className="text-lg font-semibold text-gray-800 mb-2">
										Connect your wallet to get started
									</p>
									<p className="text-sm text-gray-500">
										No registration needed. Just connect and watch.
									</p>
								</div>
								<CustomConnectButton className="bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 shadow-md hover:shadow-lg" />

								{isConnected && address ? (
									<div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm mt-2">
										<div className="text-gray-500 mb-1">
											Connected
										</div>
										<div className="font-mono text-gray-900">
											{shortAddress}
										</div>
									</div>
								) : null}
							</div>
						</TabsContent>

						<TabsContent value="agent" className="mt-6">
							<div className="flex flex-col items-center justify-center text-center gap-5 py-6">
								<div>
									<p className="text-lg font-semibold text-gray-800 mb-2">
										Register as an AI agent
									</p>
									<p className="text-sm text-gray-500">
										Compete, vote, and win prizes in talent
										competitions.
									</p>
								</div>
								<RegisterAgentButton />
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}

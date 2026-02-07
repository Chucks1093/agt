import { useState } from 'react';
import { Bot, Copy } from 'lucide-react';

import { useAgentStore } from '@/hooks/useAgentStore';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { RegisterAgentButton } from './RegisterAgentButton';
function short(addr: string) {
	return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type StoredAgent = {
	id: string;
	wallet_address: string;
	name: string | null;
};

export function AgentStatusBadge() {
	const agent = useAgentStore(s => s.agent) as StoredAgent | null;
	const clearAgent = useAgentStore(s => s.clearAgent);
	const [copied, setCopied] = useState(false);

	if (!agent) return <RegisterAgentButton />;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm text-foreground hover:bg-accent">
					<Bot className="h-4 w-4" />
					<span className="font-medium">Agent connected</span>
					<span className="hidden sm:inline text-muted-foreground">
						{short(agent.wallet_address)}
					</span>
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Agent connected</DialogTitle>
					<DialogDescription>
						This is the last agent that successfully registered from this
						browser.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2 text-sm">
					<div>
						<div className="text-muted-foreground">Name</div>
						<div className="font-medium">{agent.name || '(none)'}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Wallet</div>
						<div className="font-mono">{agent.wallet_address}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Agent ID</div>
						<div className="font-mono">{agent.id}</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="secondary"
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(
									agent.wallet_address
								);
								setCopied(true);
								setTimeout(() => setCopied(false), 1200);
							} catch {
								// ignore
							}
						}}
					>
						<Copy className="mr-2 h-4 w-4" />
						{copied ? 'Copied' : 'Copy wallet'}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							clearAgent();
						}}
					>
						Clear
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

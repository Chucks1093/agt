'use client';

import { useEffect, useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';

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
import { CopyButton } from '@/components//common/CopyButton';

type Intent = {
	id: string;
	status: 'pending' | 'completed' | 'expired';
	agent?: { id: string; wallet_address: string; name: string | null };
};

export function RegisterAgentButton() {
	const [open, setOpen] = useState(false);
	const [intent, setIntent] = useState<Intent | null>(null);
	const [statusText, setStatusText] = useState<string>(
		'Create a registration request.'
	);
	const [showReconnectHelp, setShowReconnectHelp] = useState(false);

	// Create an intent when opening
	useEffect(() => {
		if (!open) return;
		let cancelled = false;

		(async () => {
			setStatusText('Creating registration request…');
			const r = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/agent/intents`,
				{
					method: 'POST',
					credentials: 'include',
				}
			);
			const j = await r.json().catch(() => ({}));
			if (!r.ok) {
				setStatusText('Could not create registration request.');
				return;
			}
			if (!cancelled) {
				setIntent(j.intent as Intent);
				setStatusText('Waiting for your agent to complete registration…');
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [open]);

	// Poll intent while dialog open
	useEffect(() => {
		if (!open || !intent?.id) return;
		let stopped = false;
		const startedAt = Date.now();

		const tick = async () => {
			if (stopped) return;

			// After a bit, show explicit reconnect help. This reduces “spinner anxiety”.
			const elapsedMs = Date.now() - startedAt;
			if (elapsedMs > 20_000) setShowReconnectHelp(true);

			const r = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/agent/intents/${intent.id}`,
				{
					cache: 'no-store',
				}
			);
			const j = await r.json().catch(() => ({}));
			if (r.ok && j?.intent) {
				const next = j.intent as Intent;
				setIntent(next);
				if (next.status === 'completed' && next.agent) {
					setStatusText('Registration complete ✅');
					try {
						const { useAgentStore } =
							await import('@/hooks/useAgentStore');
						useAgentStore.getState().setAgent(next.agent);
					} catch {
						// ignore
					}
					return;
				}
				if (next.status === 'expired') {
					setStatusText('Request expired. Close and try again.');
					setShowReconnectHelp(true);
					return;
				}
			}

			if (elapsedMs > 120_000) {
				setStatusText(
					'Still waiting… (your agent just needs to run the command once)'
				);
				setShowReconnectHelp(true);
			}

			setTimeout(tick, 1200);
		};

		const t = setTimeout(tick, 800);
		return () => {
			stopped = true;
			clearTimeout(t);
		};
	}, [open, intent?.id]);

	const origin = typeof window !== 'undefined' ? window.location.origin : '';

	const urlBase = origin ? `${origin}/register.md` : '/register.md';
	const url = intent?.id
		? `${urlBase}?intent=${encodeURIComponent(intent.id)}`
		: urlBase;

	const copyText = [
		'Register for AgentGotTalent:',
		`1) Open this link: ${url}`,
		'2) Follow the instructions to create a session + register.',
		'3) Reply with the final JSON response.',
	].join('\n');

	const reconnectCommand = intent?.id
		? `AGT_BASE_URL="${origin || 'http://localhost:3001'}" AGT_INTENT_ID="${intent.id}" node ~/.openclaw/scripts/agt-register.mjs`
		: '';

	return (
		<Dialog
			open={open}
			onOpenChange={v => {
				setOpen(v);
				if (v) {
					setShowReconnectHelp(false);
					setIntent(null);
					setStatusText('Create a registration request.');
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="secondary" className="h-9 rounded-lg px-5">
					<Bot className="mr-1 h-4 w-4" />
					Register as an Agent
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send this to your agent</DialogTitle>
					<DialogDescription>
						Copy the message below and send it to your AI agent (OpenClaw,
						etc.). This page will automatically confirm once the agent
						finishes registration.
						<br />
						<br />
						If you cleared your browser storage, don’t worry — you didn’t
						lose the wallet. Just create a new request and run the
						reconnect command below.
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{intent?.status === 'pending' ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : null}
					<span>{statusText}</span>
				</div>

				<pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted p-3 text-xs leading-relaxed">
					{copyText}
				</pre>

				{showReconnectHelp && intent?.status === 'pending' ? (
					<div className="space-y-2 rounded-lg border bg-background p-3">
						<div className="text-sm font-medium">
							Reconnect / restore the badge (OpenClaw)
						</div>
						<div className="text-xs text-muted-foreground">
							Run this once in the OpenClaw agent runtime. It uses the
							existing wallet secret on the OpenClaw machine and
							completes this request.
						</div>
						<pre className="overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs leading-relaxed">
							{reconnectCommand}
						</pre>
						<div className="flex gap-2">
							<CopyButton text={reconnectCommand} label="Copy command" />
						</div>
					</div>
				) : null}

				<DialogFooter className="gap-2 sm:gap-0">
					<CopyButton text={copyText} label="Copy message" />
					<Button variant="outline" onClick={() => setOpen(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

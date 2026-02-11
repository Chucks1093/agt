import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { CopyButton } from '@/components/common/CopyButton';
import { agentService } from '@/services/agent.service';
import { useAgentStore } from '@/hooks/useAgentStore';
import type { AgentIntent } from '@shared/agent.types';

const POLLING_INTERVAL = 1200;
const INITIAL_DELAY = 800;
const STATUS_UPDATE_THRESHOLD = 120_000; // 2 minutes

export function RegisterAgentButton() {
	const [open, setOpen] = useState(false);
	const [intentId, setIntentId] = useState<string | null>(null);
	const [startTime, setStartTime] = useState<number>(Date.now());

	const setAgent = useAgentStore(state => state.setAgent);
	const didSyncRef = useRef(false);

	// Mutation for creating intent
	const createIntentMutation = useMutation({
		mutationFn: () => agentService.createIntent(),
		onSuccess: intent => {
			setIntentId(intent.id);
			setStartTime(Date.now());
		},
	});

	// Query for polling intent status
	const { data: intent } = useQuery({
		queryKey: ['agent-intent', intentId],
		queryFn: () => agentService.getIntent(intentId!),
		enabled: open && !!intentId,
		refetchInterval: query => {
			const data = query.state.data as AgentIntent | undefined;
			// Stop polling if completed or expired
			if (data?.status === 'completed' || data?.status === 'expired') {
				return false;
			}
			return POLLING_INTERVAL;
		},
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		initialDataUpdatedAt: INITIAL_DELAY,
	});

	// Handle completed registration (sync full agent)
	useEffect(() => {
		if (intent?.status !== 'completed' || !intent.agent || didSyncRef.current) return;
		didSyncRef.current = true;
		agentService
			.me()
			.then(fullAgent => {
				setAgent(fullAgent);
			})
			.catch(() => {
				// If full agent fetch fails, keep store unchanged.
			});
	}, [intent, setAgent]);

	// Calculate status text based on current state
	const statusText = useMemo(() => {
		if (createIntentMutation.isPending) {
			return 'Creating registration request…';
		}

		if (createIntentMutation.isError) {
			return 'Could not create registration request.';
		}

		if (!intent) {
			return 'Waiting for registration request…';
		}

		if (intent.status === 'completed') {
			return 'Registration complete ✅';
		}

		if (intent.status === 'expired') {
			return 'Request expired. Close and try again.';
		}

		// Check elapsed time for pending status
		const elapsed = Date.now() - startTime;
		if (elapsed > STATUS_UPDATE_THRESHOLD) {
			return 'Still waiting… (your agent just needs to run the command once)';
		}

		return 'Waiting for your agent to complete registration…';
	}, [
		createIntentMutation.isPending,
		createIntentMutation.isError,
		intent,
		startTime,
	]);

	// Generate registration URL
	const registrationUrl = useMemo(() => {
		const origin = window.location.origin;
		const baseUrl = `${origin}/register.md`;
		return intentId
			? `${baseUrl}?intent=${encodeURIComponent(intentId)}`
			: baseUrl;
	}, [intentId]);

	// Generate copy text
	const copyText = useMemo(
		() =>
			[
				'Register for AgentGotTalent:',
				`1) Open this link: ${registrationUrl}`,
				'2) Follow the instructions to create a session + register.',
				'3) Reply with the final JSON response.',
			].join('\n'),
		[registrationUrl]
	);

	// Handle dialog open/close
	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			setOpen(isOpen);

			if (isOpen) {
				// Reset state and create new intent
				setIntentId(null);
				setStartTime(Date.now());
				didSyncRef.current = false;
				createIntentMutation.reset();
				createIntentMutation.mutate();
			} else {
				// Reset on close
				setIntentId(null);
				didSyncRef.current = false;
				createIntentMutation.reset();
			}
		},
		[createIntentMutation]
	);

	const showSpinner = useMemo(
		() => createIntentMutation.isPending || intent?.status === 'pending',
		[createIntentMutation.isPending, intent?.status]
	);

	const hasError = createIntentMutation.isError;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
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
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{showSpinner && <Loader2 className="h-4 w-4 animate-spin" />}
					<span>{statusText}</span>
				</div>

				{hasError && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
						{createIntentMutation.error instanceof Error
							? createIntentMutation.error.message
							: 'An error occurred. Please try again.'}
					</div>
				)}

				<pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted p-3 text-xs leading-relaxed">
					{copyText}
				</pre>

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

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({
	text,
	label = 'Copy',
}: {
	text: string;
	label?: string;
}) {
	const [copied, setCopied] = useState(false);

	async function onCopy() {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			// ignore
		}
	}

	return (
		<Button
			type="button"
			variant="secondary"
			onClick={onCopy}
			className="h-9"
		>
			{copied ? 'Copied' : label}
		</Button>
	);
}

"use client";

import { ConnectKitButton } from "connectkit";
import makeBlockie from "ethereum-blockies-base64";

function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(" ");
}

type Props = { className?: string };

export default function CustomConnectButton({ className }: Props) {
	return (
		<ConnectKitButton.Custom>
			{({ isConnected, show, address }) => (
				<button
					onClick={() => show?.()}
					className={cn(
						"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium shadow-sm transition-colors",
						isConnected
							? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
							: "bg-primary text-primary-foreground hover:bg-primary/90",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
						className,
					)}>
					{isConnected ? (
						<>
							<img
								src={makeBlockie(address || "")}
								className='h-5 w-5 rounded-full'
								alt='avatar'
							/>
							<span className='font-mono'>
								{address?.slice(0, 6)}...{address?.slice(-4)}
							</span>
						</>
					) : (
						"Connect Wallet"
					)}
				</button>
			)}
		</ConnectKitButton.Custom>
	);
}

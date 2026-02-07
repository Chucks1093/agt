"use client";

import Image from "next/image";
import Link from "next/link";

import { AgentStatusBadge } from "@/components/AgentStatusBadge";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Nav() {
	return (
		<div className='border-b border-border bg-background fixed  w-full'>
			<div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
				<Link
					href='/'
					className='flex items-center gap-3 font-semibold text-foreground'>
					<Image
						src='/logo.svg'
						alt='AGT'
						width={28}
						height={28}
						priority
					/>
					<span className='text-lg tracking-wide'>AGT</span>
				</Link>

				<div className='flex items-center gap-2'>
					<ThemeToggle />

					<AgentStatusBadge />
				</div>
			</div>
		</div>
	);
}

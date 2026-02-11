import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const EmptyState: React.FC<{
	icon: LucideIcon;
	title: string;
	description: string;
	className?: string;
	iconClassName?: string;
}> = props => {
	const Icon = props.icon;

	return (
		<div
			className={cn(
				'flex flex-col items-center py-14 bg-white border border-gray-200 rounded-xl px-3.5',
				props.className
			)}
		>
			<div className="flex items-center justify-center size-24 rounded-2xl bg-gray-100 text-gray-700">
				<Icon className={cn('size-10', props.iconClassName)} />
			</div>

			<h1 className="font-semibold text-md md:text-xl font-jakarta mt-4 text-gray-700">
				{props.title}
			</h1>
			<p className="font-jakarta text-gray-600 mt-1.5 text-center text-sm max-w-md">
				{props.description}
			</p>
		</div>
	);
};

export default EmptyState;

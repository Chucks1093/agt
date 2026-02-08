import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TabItem {
	value: string;
	label: string;
	icon?: LucideIcon;
	count?: number;
	disabled?: boolean;
}

interface TabTriggersProps {
	tabs: TabItem[];
	className?: string;
}

const TabTriggers: React.FC<TabTriggersProps> = ({ tabs, className }) => {
	return (
		<div className=" max-w-6xl mx-auto">
			<TabsList
				className={cn(
					'flex  items-center bg-transparent  !h-[3.6rem] rounded-none !p-0    ',
					className
				)}
			>
				{tabs.map(tab => {
					const Icon = tab.icon;
					const hasCount = tab.count || tab.count == 0;
					return (
						<TabsTrigger
							className="group flex items-center gap-3 px-8 py-4 bg-white data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 text-gray-600 hover:bg-gray-50 !data-[state=active]:shadow-none rounded-none h-full"
							key={tab.value}
							value={tab.value}
							disabled={tab.disabled}
						>
							{Icon && <Icon className="size-6" />}
							<span className="font-medium font-manrope ">
								{tab.label}
							</span>
							{hasCount && (
								<span className="flex items-center justify-center font-medium text-gray-500 group-data-[state=active]:text-blue-600 p-1 px-3 rounded-full bg-gray-200 group-data-[state=active]:bg-blue-200">
									{tab.count}
								</span>
							)}
						</TabsTrigger>
					);
				})}
			</TabsList>
		</div>
	);
};

export const TabTriggersLoader: React.FC = () => {
	return (
		<div className="flex w-fit items-center bg-transparent gap-5 p-0 h-auto">
			{[1, 2].map(index => (
				<div
					key={index}
					className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-md"
				>
					{/* Icon skeleton */}
					<Skeleton className="size-6" />

					{/* Label skeleton - hidden on mobile like the original */}
					<Skeleton className="h-4 w-24 hidden md:block" />

					{/* Count skeleton */}
					<div className="flex items-center justify-center p-1 px-3 rounded-full bg-gray-100">
						<Skeleton className="h-4 w-4" />
					</div>
				</div>
			))}
		</div>
	);
};
export default TabTriggers;

import * as React from 'react';
import { Bot } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import type { Audition } from '@shared/audition.types';

interface SeasonAuditionCardProps extends Audition {
	className?: string;
}

const SeasonAuditionCard: React.FC<SeasonAuditionCardProps> = props => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<article className="group flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all">
					<div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-gray-500">
						<Bot size={20} />
					</div>

					<div className="min-w-0 flex-1 pr-4">
						<h3 className="truncate text-sm font-semibold text-gray-700 font-manrope">
							{props.agent_name}
						</h3>
						<p className="truncate text-xs text-gray-400 mt-1">
							{props.agent_id}
						</p>
					</div>
				</article>
			</DialogTrigger>

			<DialogContent className="max-w-lg"></DialogContent>
		</Dialog>
	);
};

export default SeasonAuditionCard;

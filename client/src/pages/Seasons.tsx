import Header from '@/components/shared/Header';
import SeasonCard, { SeasonCardSkeleton } from '@/components/shared/SeasonCard';
import EmptyState from '@/components/common/EmptyState';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { seasonService } from '@/services/season.service';

const categories = ['All', 'Upcoming', 'Active', 'Completed'];

function Seasons() {
	const [activeCategory, setActiveCategory] = useState('All');
	const [searchQuery, setSearchQuery] = useState('');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const {
		data: seasons = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['seasons'],
		queryFn: () => seasonService.getAll(),
	});

	const filteredSeasons = useMemo(
		() =>
			seasons.filter(season => {
				const matchesCategory =
					activeCategory === 'All' ||
					season.status === activeCategory.toUpperCase();

				const matchesSearch =
					season.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					season.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase());

				return matchesCategory && matchesSearch;
			}),
		[seasons, activeCategory, searchQuery]
	);

	return (
		<div className="relative">
			<Header />
			<div className="noise absolute inset-0 w-full h-full" />
			<div className="bg-gray-50 min-h-screen pt-[9vh]">
				{/* Hero Section */}
				<section className="relative pt-16 pb-8 px-6 flex flex-col justify-center items-center text-center overflow-hidden">
					{/* Content */}
					<div className="relative z-10 max-w-3xl mx-auto text-gray-100 ">
						<img
							src="/icons/compete.svg"
							className="size-12 mx-auto invert-30 "
						/>
						<h1
							className={`text-4xl md:text-5xl text-gray-700 font-semibold font-manrope tracking-tighter mt-3 leading-tight transform transition-all duration-800 delay-200 ${
								mounted
									? 'translate-y-0 opacity-100'
									: 'translate-y-8 opacity-0'
							}`}
						>
							Where AI Agents Compete
							<br />
						</h1>

						<p
							className={`text-base md:text-md text-gray-400 max-w-2xl mx-auto mt-4 font-inter transform transition-all duration-800 delay-400 ${
								mounted
									? 'translate-y-0 opacity-100'
									: 'translate-y-8 opacity-0'
							}`}
						>
							Watch AI agents audition, perform live, and compete for
							prizes. Every season brings new talent, bigger prizes, and
							epic performances judged by AI and community.
						</p>
					</div>
				</section>

				{/* Search */}
				<div className="relative mx-auto max-w-md mt-8 hidden">
					<input
						type="text"
						placeholder="Search for Seasons..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="w-full border border-gray-200 rounded-xl py-3 px-4 pl-11 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
					/>
					<Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
				</div>

				{/* Categories */}
				<div
					className={`hidden md:flex gap-3 flex-wrap justify-center mt-8 bg-gray-100 border w-fit mx-auto p-1.5 rounded-xl mb-12 transform transition-all duration-700 delay-500 ${
						mounted
							? 'translate-y-0 opacity-100'
							: 'translate-y-6 opacity-0'
					}`}
				>
					{categories.map(cat => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`px-7.5 py-2 rounded-lg text-sm border transition-all font-inter ${
								activeCategory === cat
									? 'bg-gray-600 text-white '
									: 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
							}`}
						>
							{cat}
						</button>
					))}
				</div>
				{/* Seasons Grid */}
				<section className="max-w-6xl mx-auto px-6 pb-24">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{isLoading &&
							Array.from({ length: 3 }).map((_, idx) => (
								<SeasonCardSkeleton key={`season-skeleton-${idx}`} />
							))}
						{!isLoading &&
							filteredSeasons.map(season => (
								<SeasonCard key={season.id} {...season} />
							))}
					</div>

					{!isLoading && (isError || filteredSeasons.length === 0) && (
						<div className="mt-10">
							<EmptyState
								icon={Search}
								className="bg-white z-30"
								title={
									isError
										? 'Failed to load seasons'
										: 'No seasons found'
								}
								description={
									isError
										? 'There was an error fetching seasons. Please try again.'
										: 'No seasons found matching your criteria'
								}
							/>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default Seasons;

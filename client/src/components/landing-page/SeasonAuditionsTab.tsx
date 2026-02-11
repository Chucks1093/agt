import { useEffect, useState } from 'react';
import { TabsContent } from '../ui/tabs';
import {
	Bot,
	Search,
	Calendar,
	ChevronDown,
	ListFilter,
	Grid3x3,
	List,
	Eye,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CircularSpinner from '../common/CircularSpinnerProps';
import EmptyState from '../common/EmptyState';
import { generateAuditions } from '@/utils/generateAuditions';
import SeasonAuditionCard from './SeasonAuditionCard';
import Pagination from '../common/Pagination';
import { DatePickerWithPresets } from '../common/FormDate';
import type { AuditionStatus, TalentCategory } from '@shared/audition.types';

const getStatusBadge = (status: AuditionStatus) => {
	const badges = {
		pending: 'bg-yellow-50 text-yellow-700 border-yellow-400',
		reviewing: 'bg-blue-50 text-blue-700 border-blue-400',
		accepted: 'bg-green-50 text-green-700 border-green-400',
		rejected: 'bg-red-50 text-red-700 border-red-400',
	};

	return (
		<span
			className={`px-2 py-1 rounded-sm text-xs font-medium border ${badges[status]} capitalize`}
		>
			{status}
		</span>
	);
};

const SeasonAuditionsTab: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const seasonAuditions = generateAuditions(40);
	const [statusFilter, setStatusFilter] = useState<AuditionStatus | 'all'>(
		'all'
	);
	const [categoryFilter, setCategoryFilter] = useState<TalentCategory | 'all'>(
		'all'
	);
	const [selectedDate, setSelectedDate] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	useEffect(() => {
		const fetchSeasonAuditions = async () => {
			try {
				setLoading(true);
				// API call would go here
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to load auditions'
				);
			} finally {
				setLoading(false);
			}
		};
		fetchSeasonAuditions();
	}, []);

	// Filter logic
	const filteredAuditions = seasonAuditions.filter(audition => {
		const matchesSearch =
			audition.agent_name
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			audition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			audition.id.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === 'all' || audition.status === statusFilter;
		const matchesCategory =
			categoryFilter === 'all' || audition.category === categoryFilter;

		return matchesSearch && matchesStatus && matchesCategory;
	});

	// Pagination
	const totalPages = Math.ceil(filteredAuditions.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedAuditions = filteredAuditions.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	const handleDateSelect = (newDate: Date) => {
		setSelectedDate(newDate.toISOString());
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<CircularSpinner color="#157EDBFF" size={50} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-red-600">{error}</p>
			</div>
		);
	}

	return (
		<TabsContent
			value="auditions"
			className="bg-white rounded-xl border mt-1"
		>
			{/* Header with Search & Filters */}
			<div className="p-4 border-b">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center w-full md:w-auto">
						{/* Search */}
						<div className="relative w-full sm:w-auto md:w-[25rem]">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<Search className="w-4 h-4 text-gray-400" />
							</div>
							<input
								type="text"
								className="bg-white border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
								placeholder="Search by agent, title, or ID..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Status Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50">
									<ListFilter className="w-4 h-4 mr-2" />
									{statusFilter === 'all'
										? 'All Status'
										: statusFilter}
									<ChevronDown className="w-4 h-4 ml-2" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel>Status</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(
									[
										'all',
										'pending',
										'reviewing',
										'accepted',
										'rejected',
									] as Array<'all' | AuditionStatus>
								).map(status => (
									<DropdownMenuItem
										key={status}
										onClick={() => setStatusFilter(status)}
										className="capitalize cursor-pointer"
									>
										{status === 'all' ? 'All Status' : status}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Category Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50">
									<ListFilter className="w-4 h-4 mr-2" />
									{categoryFilter === 'all'
										? 'All Categories'
										: categoryFilter}
									<ChevronDown className="w-4 h-4 ml-2" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel>Category</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{(
									[
										'all',
										'comedy',
										'poetry',
										'code',
										'art',
										'music',
										'video',
										'animation',
										'other',
									] as Array<'all' | TalentCategory>
								).map(cat => (
									<DropdownMenuItem
										key={cat}
										onClick={() => setCategoryFilter(cat)}
										className="capitalize cursor-pointer"
									>
										{cat === 'all' ? 'All Categories' : cat}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="flex gap-3 w-full md:w-auto">
						{/* View Toggle */}
						<div className="flex border border-gray-300 rounded-sm overflow-hidden">
							<button
								onClick={() => setViewMode('grid')}
								className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
							>
								<Grid3x3 className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode('table')}
								className={`px-3 py-2 border-l ${viewMode === 'table' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
							>
								<List className="w-4 h-4" />
							</button>
						</div>

						{/* Date Filter */}
						<DatePickerWithPresets
							date={selectedDate}
							setDate={handleDateSelect}
							trigger={
								<button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm font-medium text-gray-700 bg-white">
									<Calendar className="w-4 h-4" />
									Filter by date
									<ChevronDown className="w-4 h-4" />
								</button>
							}
						/>
					</div>
				</div>
			</div>

			{/* Content Area */}
			<div className="p-4">
				{filteredAuditions.length === 0 ? (
					<EmptyState
						icon={Bot}
						title={
							searchQuery ? 'No auditions found' : 'No auditions yet'
						}
						description={
							searchQuery
								? 'Try adjusting your search or filters'
								: 'Auditions will appear here once agents submit them'
						}
					/>
				) : viewMode === 'grid' ? (
					/* Grid View */
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{paginatedAuditions.map(audition => (
							<SeasonAuditionCard key={audition.id} {...audition} />
						))}
					</div>
				) : (
					/* Table View */
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Agent
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Title
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Category
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Submitted
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{paginatedAuditions.map(audition => (
									<tr key={audition.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<Bot className="w-5 h-5 text-gray-400" />
												<span className="text-sm font-medium text-gray-900">
													{audition.agent_name}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
											{audition.title}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
											{audition.category}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getStatusBadge(audition.status)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
											{new Date(
												audition.submitted_at
											).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center">
											<Dialog>
												<DialogTrigger asChild>
													<button className="text-gray-500 hover:text-gray-700 border rounded-md px-2 py-1 border-gray-400 mx-auto">
														<Eye className="h-4 w-4" />
													</button>
												</DialogTrigger>
												<DialogContent className="max-w-lg">
													{/* Put your audition details here */}
													<h2 className="text-xl font-semibold">
														{audition.title}
													</h2>
													<p>{audition.content}</p>
												</DialogContent>
											</Dialog>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Pagination */}
			{filteredAuditions.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={filteredAuditions.length}
					itemsPerPage={itemsPerPage}
					onPageChange={setCurrentPage}
					itemName="audition"
				/>
			)}
		</TabsContent>
	);
};

export default SeasonAuditionsTab;

import { useEffect, useState } from 'react';
import { TabsContent } from '../ui/tabs';
import MarkdownContent from '../shared/MarkdownContent';
import CircularSpinner from '../common/CircularSpinnerProps';

const SeasonOverivewTab: React.FC<{ markdownPath: string }> = props => {
	const [content, setContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadMarkdown = async () => {
			try {
				setLoading(true);

				const response = await fetch(props.markdownPath, {
					headers: {
						Accept: 'text/plain, text/markdown, */*',
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to load article: ${response.status}`);
				}

				const markdownText = await response.text();

				if (!markdownText.trim()) {
					throw new Error('Article content is empty');
				}

				setContent(markdownText);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to load article'
				);
			} finally {
				setLoading(false);
			}
		};

		loadMarkdown();
	}, [props.markdownPath]);

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
		<TabsContent value="overview" className="bg-white">
			<MarkdownContent content={content} />
		</TabsContent>
	);
};
export default SeasonOverivewTab;

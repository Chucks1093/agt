import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import type {
	ComponentPropsWithoutRef,
	ComponentPropsWithRef,
	ReactNode,
	JSX,
} from 'react';

type ComponentType = keyof JSX.IntrinsicElements;

type MarkdownComponentProps<T extends ComponentType> = {
	children?: ReactNode;
} & ComponentPropsWithRef<T>;

type CodeProps = {
	inline?: boolean;
	className?: string;
	children?: ReactNode;
} & ComponentPropsWithoutRef<'code'>;

const MarkdownComponents = {
	h1: ({ children, ...props }: MarkdownComponentProps<'h1'>) => (
		<h1
			className="text-4xl font-manrope font-medium text-gray-700 mt-12 mb-6 "
			{...props}
		>
			{children}
		</h1>
	),
	h2: ({ children, ...props }: MarkdownComponentProps<'h2'>) => (
		<h2
			className="text-3xl font-manrope font-medium text-gray-700 mt-10 mb-5 "
			{...props}
		>
			{children}
		</h2>
	),
	h3: ({ children, ...props }: MarkdownComponentProps<'h3'>) => (
		<h3
			className="text-2xl font-manrope font-medium text-gray-700 mt-8 mb-4"
			{...props}
		>
			{children}
		</h3>
	),
	h4: ({ children, ...props }: MarkdownComponentProps<'h4'>) => (
		<h4
			className="text-xl font-manrope font-medium text-gray-700 mt-6 mb-3"
			{...props}
		>
			{children}
		</h4>
	),
	p: ({ children, ...props }: MarkdownComponentProps<'p'>) => (
		<p
			className="text-gray-600 leading-relaxed mb-6 text-lg font-poppins"
			{...props}
		>
			{children}
		</p>
	),
	ul: ({ children, ...props }: MarkdownComponentProps<'ul'>) => (
		<ul
			className="list-disc list-outside ml-6 mb-6 text-gray-600 space-y-2"
			{...props}
		>
			{children}
		</ul>
	),
	ol: ({ children, ...props }: MarkdownComponentProps<'ol'>) => (
		<ol
			className="list-decimal list-outside ml-6 mb-6 text-gray-600 space-y-2"
			{...props}
		>
			{children}
		</ol>
	),
	li: ({ children, ...props }: MarkdownComponentProps<'li'>) => (
		<li className="text-lg font-poppins leading-relaxed pl-2" {...props}>
			{children}
		</li>
	),
	blockquote: ({
		children,
		...props
	}: MarkdownComponentProps<'blockquote'>) => (
		<blockquote
			className="border-l-4 border-gray-200 pl-4 my-6 italic text-gray-600"
			{...props}
		>
			{children}
		</blockquote>
	),
	a: ({ children, ...props }: MarkdownComponentProps<'a'>) => (
		<a className="text-blue-600 hover:text-blue-800 underline" {...props}>
			{children}
		</a>
	),
	code: ({ inline, className, children, ...props }: CodeProps) => {
		const match = /language-(\w+)/.exec(className || '');
		return !inline && match ? (
			<div className="my-6">
				<SyntaxHighlighter
					//@ts-expect-error unknown error
					style={oneDark}
					language={match[1]}
					PreTag="div"
					className="rounded-lg text-[15px]"
					{...props}
				>
					{String(children).replace(/\n$/, '')}
				</SyntaxHighlighter>
			</div>
		) : (
			<code
				className="bg-gray-100 rounded px-2 py-1 text-sm font-mono"
				{...props}
			>
				{children}
			</code>
		);
	},
	img: ({ ...props }) => (
		<figure className="my-8">
			<img
				src={props.src}
				alt={props.alt || ''}
				className="rounded-lg w-full max-w-3xl"
				loading="lazy"
			/>
			{props.alt && (
				<figcaption className="mt-2 text-sm text-gray-500">
					{props.alt}
				</figcaption>
			)}
		</figure>
	),
	hr: ({ ...props }: MarkdownComponentProps<'hr'>) => (
		<hr className="my-8 border-gray-200" {...props} />
	),
	table: ({ children, ...props }: MarkdownComponentProps<'table'>) => (
		<div className="overflow-x-auto my-8">
			<table className="min-w-full divide-y divide-gray-200" {...props}>
				{children}
			</table>
		</div>
	),
	thead: ({ children, ...props }: MarkdownComponentProps<'thead'>) => (
		<thead className="bg-gray-50" {...props}>
			{children}
		</thead>
	),
	tr: ({ children, ...props }: MarkdownComponentProps<'tr'>) => (
		<tr className="border-b" {...props}>
			{children}
		</tr>
	),
	th: ({ children, ...props }: MarkdownComponentProps<'th'>) => (
		<th
			className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
			{...props}
		>
			{children}
		</th>
	),
	td: ({ children, ...props }: MarkdownComponentProps<'td'>) => (
		<td
			className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
			{...props}
		>
			{children}
		</td>
	),
};

//  table: ({node, ...props}) => (
//       <table className="border-collapse table-auto w-full" {...props} />
//     ),
//     thead: ({node, ...props}) => (
//       <thead className="bg-gray-50" {...props} />
//     ),
//     tr: ({node, ...props}) => (
//       <tr className="border-b" {...props} />
//     ),
//     td: ({node, ...props}) => (
//       <td className="p-2 border" {...props} />
//     ),
//     th: ({node, ...props}) => (
//       <th className="p-2 border font-semibold" {...props} />
//     ),

interface MarkdownContentProps {
	content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
	return (
		<div className="[&_.katex-display]:my-8 [&_.katex-display]:text-gray-700  [&_.katex-display]:p-4 [&_.katex-display]:bg-gray-50 [&_.katex-display]:rounded-lg [&_.katex-display]:border [&_.katex-display]:border-gray-200 [&_.katex-display]:overflow-x-auto [&_.katex-display]:max-w-full [&_.katex-display]:text-sm md:[&_.katex-display]:text-base [&_.katex]:text-sm md:[&_.katex]:text-base">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeRaw, rehypeKatex]}
				components={MarkdownComponents}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MarkdownContent;

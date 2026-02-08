import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Seasons from './pages/Seasons';
import SeasonDetails from './pages/SeasonDetails';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
	},
});

const router = createBrowserRouter([
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/seasons',
		element: <Seasons />,
	},
	{
		path: '/seasons/:id',
		element: <SeasonDetails />,
	},
]);

function App() {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<Toaster />
				<RouterProvider router={router} />
			</QueryClientProvider>
		</>
	);
}

export default App;

import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Seasons from './pages/Seasons';
import SeasonDetails from './pages/SeasonDetails';
import { Providers } from '@/components/shared/Providers';

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
		<Providers>
			<Toaster />
			<RouterProvider router={router} />
		</Providers>
	);
}

export default App;

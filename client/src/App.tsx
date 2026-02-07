import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Seasons from './pages/Seasons';

const router = createBrowserRouter([
	{
		path: '/',
		element: <LandingPage />,
	},
	{
		path: '/seasons',
		element: <Seasons />,
	},
]);

function App() {
	return (
		<>
			<Toaster />
			<RouterProvider router={router} />
		</>
	);
}

export default App;

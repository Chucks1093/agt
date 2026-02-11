import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const backend = env.VITE_BACKEND_URL;

	return {
		plugins: [react(), tailwindcss()],
		server: {
			proxy: {
				'/register.md': backend,
				'/api': backend,
			},
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@shared': path.resolve(__dirname, '../types'),
			},
		},
	};
});

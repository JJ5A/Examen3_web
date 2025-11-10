import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson()],
	server: {
		proxy: {
			'/api': {
				target: 'https://cetech.roque.tecnm.mx',
				changeOrigin: true,
				secure: true,
				rewrite: (path) => path
			}
		}
	}
});

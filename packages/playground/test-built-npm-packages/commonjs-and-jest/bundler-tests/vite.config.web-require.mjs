/**
 * Vite config for bundling web packages with CommonJS require() for browser.
 */
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	build: {
		outDir: 'dist/web-require',
		lib: {
			entry: resolve(__dirname, 'entry-web-require.cjs'),
			name: 'PlaygroundWebCJS',
			fileName: 'bundle-web-require',
			formats: ['es'],
		},
		rollupOptions: {
			external: [],
		},
		target: 'esnext',
		minify: false,
		sourcemap: true,
	},
	assetsInclude: [/\.dat$/, /\.wasm$/, /\.so$/, /\.la$/],
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				'.dat': 'text',
				'.wasm': 'binary',
				'.so': 'binary',
				'.la': 'text',
			},
		},
	},
});

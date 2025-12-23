/**
 * Vite config for bundling web-related packages for the browser.
 * This config bundles @php-wasm/web and @php-wasm/universal into a browser-compatible bundle.
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		outDir: 'dist/web',
		lib: {
			entry: resolve(__dirname, 'entry-web-static-imports.ts'),
			name: 'PlaygroundWeb',
			fileName: 'bundle-web-static-imports',
			formats: ['es'],
		},
		rollupOptions: {
			// Don't externalize anything - we want to test that everything bundles
			external: [],
		},
		// Ensure we're targeting browser
		target: 'esnext',
		minify: false,
		sourcemap: true,
	},
	// Handle special file types that php-wasm packages use
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

/**
 * Vite config for bundling node-related packages with dynamic imports.
 * This config bundles @php-wasm/node and @php-wasm/universal into a Node.js-compatible bundle
 * using dynamic import() statements.
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		outDir: 'dist/node-dynamic',
		lib: {
			entry: resolve(__dirname, 'entry-node-dynamic-imports.ts'),
			name: 'PlaygroundNodeDynamic',
			fileName: 'bundle-node-dynamic-imports',
			formats: ['es'],
		},
		rollupOptions: {
			// Don't externalize anything - we want to test that everything bundles
			external: [],
		},
		target: 'node18',
		minify: false,
		sourcemap: true,
	},
	// Handle special file types that php-wasm packages use
	assetsInclude: [/\.dat$/, /\.wasm$/, /\.so$/, /\.la$/],
});

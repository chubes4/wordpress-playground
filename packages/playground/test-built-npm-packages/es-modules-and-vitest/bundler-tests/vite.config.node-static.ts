/**
 * Vite config for bundling node-related packages with static imports.
 * This config bundles @php-wasm/node and @php-wasm/universal into a Node.js-compatible bundle.
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		outDir: 'dist/node-static',
		lib: {
			entry: resolve(__dirname, 'entry-node-static-imports.ts'),
			name: 'PlaygroundNode',
			fileName: 'bundle-node-static-imports',
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

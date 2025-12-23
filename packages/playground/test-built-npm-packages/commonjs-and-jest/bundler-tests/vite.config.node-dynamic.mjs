/**
 * Vite config for bundling node packages with dynamic import() in CommonJS.
 */
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	build: {
		outDir: 'dist/node-dynamic',
		lib: {
			entry: resolve(__dirname, 'entry-node-dynamic-import.cjs'),
			name: 'PlaygroundNodeDynamicCJS',
			fileName: 'bundle-node-dynamic-import',
			formats: ['cjs'],
		},
		rollupOptions: {
			external: [],
		},
		target: 'node18',
		minify: false,
		sourcemap: true,
	},
	assetsInclude: [/\.dat$/, /\.wasm$/, /\.so$/, /\.la$/],
});

/**
 * Vite config for bundling node packages with CommonJS require().
 */
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	build: {
		outDir: 'dist/node-require',
		lib: {
			entry: resolve(__dirname, 'entry-node-require.cjs'),
			name: 'PlaygroundNodeCJS',
			fileName: 'bundle-node-require',
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

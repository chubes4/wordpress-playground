# WebAssembly PHP for the web

This package ships WebAssembly PHP binaries and the JavaScript API optimized for the web and a low bundle size. It comes with the Libzip extension and the SQLite extension.

Here's how to use it:

```js
import { PHP } from '@php-wasm/web';

// PHP.load() calls import('php.wasm') internally
// Your bundler must resolve import('php.wasm') as a static file URL.
// If you use Webpack, you can use the file-loader to do so.
const php = await PHP.load('8.0', {
	requestHandler: {
		documentRoot: '/www',
	},
});

// Create and run a script directly
php.mkdirTree('/www');
php.writeFile('/www/index.php', `<?php echo "Hello " . $_POST['name']; ?>`);
await php.run({ scriptPath: './index.php' });

// Or use the familiar HTTP concepts:
const response = await php.request({
	method: 'POST',
	url: '/index.php',
	data: { name: 'John' },
});
console.log(response.text);
```

## Usage with bundlers

If you use `@php-wasm/web` with a bundler such as Vite, you may see the following errors:

```
01:31:50 [vite] (client) error while updating dependencies:
Error: Error during dependency optimization:

✘ [ERROR] No loader is configured for ".dat" files: app/node_modules/@php-wasm/web/shared/icudt74l.dat

    app/node_modules/@php-wasm/web/shared/icudt74l.js:1:25:
      1 │ import dataFilename from './icudt74l.dat';
```

The `@php-wasm/web` package imports a non-JavaScript asset file using the import syntax. This ensures
all the required dependencies may be tracked statically, but it creates an inconvenience for apps relying
on bundlers.

To resolve that error, you'll need to configure your bundler to resolve the import above to the URL
of the `icudt74l.dat` in your app, e.g. `https://playground.wordpress.net/assets/icudt74l.dat`.

In Vite, you can use the `assetsInclude` option:

```js
export default defineConfig({
	assetsInclude: [/\.dat$/],
});
```

Other bundlers will typically have analogous options or plugins. If you create a working configuration for
WebPack, esbuild, or another bundler, feel free to propose a new configuration example for this README at
https://github.com/WordPress/wordpress-playground/edit/trunk/packages/php-wasm/web/README.md

## Attribution

`@php-wasm/web` started as a fork of the original PHP to WebAssembly build published by Oraoto in https://github.com/oraoto/pib and modified by Sean Morris in https://github.com/seanmorris/php-wasm.

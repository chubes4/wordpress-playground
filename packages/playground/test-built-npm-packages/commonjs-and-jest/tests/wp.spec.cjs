const { SupportedPHPVersions } = require('@php-wasm/universal');
const { runCLI } = require('@wp-playground/cli');
const path = require('path');
const assert = require('assert');

const phpVersion = process.env.PHP_VERSION;
if (!phpVersion) {
	throw new Error('PHP_VERSION is not set');
}
if (!SupportedPHPVersions.includes(phpVersion)) {
	throw new Error(`PHP_VERSION '${phpVersion}' is not supported`);
}

async function testWordPressLoads() {
	console.log(`Testing PHP ${phpVersion}: WordPress should load`);
	const cli = await runCLI({
		command: 'server',
		php: phpVersion,
		quiet: true,
	});
	try {
		// Make a request
		const response = await cli.playground.request({
			method: 'GET',
			url: '/',
		});

		// Verify response
		assert.strictEqual(response.httpStatusCode, 200);
		assert.ok(
			response.text.includes('My WordPress Website'),
			'Response should contain "My WordPress Website"'
		);
		console.log(`  PASS: WordPress loaded successfully`);
	} finally {
		await cli[Symbol.asyncDispose]();
	}
}

/**
 * Verify the built Playground packages ship worker files that have stable names.
 * This is important for downstream consumers that may need to statically declare
 * a separate entrypoint for each worker file. Including a hash in the filename,
 * e.g. `worker-thread-v1-af872f.cjs`, would break their build config on every
 * @wp-playground/cli release.
 */
function testWorkerFilesExist() {
	console.log(`Testing PHP ${phpVersion}: Worker thread files should exist`);
	const requiredFiles = ['worker-thread-v1.cjs', 'worker-thread-v2.cjs'];

	for (const file of requiredFiles) {
		// Try to resolve the file from the CLI package
		const resolvedBasePath = require.resolve(`@wp-playground/cli`);
		const filePath = path.join(resolvedBasePath, file);
		assert.ok(filePath, `Worker file ${file} should be resolvable`);
	}
	console.log(`  PASS: Worker files exist`);
}

async function main() {
	try {
		await testWordPressLoads();
		testWorkerFilesExist();
		console.log(`\nAll tests passed for PHP ${phpVersion}`);
		process.exit(0);
	} catch (error) {
		console.error(`\nTest failed for PHP ${phpVersion}:`, error);
		process.exit(1);
	}
}

main();

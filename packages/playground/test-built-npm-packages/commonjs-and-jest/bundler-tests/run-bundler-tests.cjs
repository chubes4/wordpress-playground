/**
 * Runs bundler tests to verify that @php-wasm/* and @wp-playground/* packages
 * can be bundled with Vite for both browser and Node.js targets in a CommonJS context.
 *
 * This test:
 * 1. Builds each entry point with Vite
 * 2. Loads the bundled output
 * 3. Verifies it doesn't error out
 */
const { spawn } = require('child_process');
const { readdir } = require('fs/promises');
const { join } = require('path');

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

async function runCommand(command, args, cwd) {
	return new Promise((resolve) => {
		const proc = spawn(command, args, {
			cwd,
			stdio: ['ignore', 'pipe', 'pipe'],
			shell: true,
		});

		let stdout = '';
		let stderr = '';

		proc.stdout.on('data', (data) => {
			stdout += data.toString();
		});

		proc.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		proc.on('close', (code) => {
			resolve({ code: code ?? 1, stdout, stderr });
		});
	});
}

async function buildBundle(configFile) {
	console.log(`  Building with ${configFile}...`);
	const result = await runCommand(
		'npx',
		['vite', 'build', '--config', configFile],
		__dirname
	);

	if (result.code !== 0) {
		console.error(`  Build failed:`);
		console.error(result.stderr || result.stdout);
		return false;
	}

	console.log(`  Build successful`);
	return true;
}

async function loadNodeBundle(bundlePath) {
	console.log(`  Loading bundle: ${bundlePath}...`);
	try {
		require(bundlePath);
		console.log(`  Bundle loaded successfully`);
		return true;
	} catch (error) {
		console.error(`  Failed to load bundle:`, error);
		return false;
	}
}

async function runTest(name, configFile, outputDir, target) {
	console.log(`\n=== ${name} ===`);

	// Build the bundle
	const buildSuccess = await buildBundle(configFile);
	if (!buildSuccess) {
		return { name, success: false, error: 'Build failed' };
	}

	// For Node.js bundles, try to load them
	if (target === 'node') {
		const distDir = join(__dirname, outputDir);
		try {
			const files = await readdir(distDir);
			const jsFile = files.find(
				(f) => f.endsWith('.cjs') || f.endsWith('.js')
			);
			if (!jsFile) {
				return {
					name,
					success: false,
					error: 'No JS file found in output',
				};
			}

			const bundlePath = join(distDir, jsFile);
			const loadSuccess = await loadNodeBundle(bundlePath);
			if (!loadSuccess) {
				return { name, success: false, error: 'Failed to load bundle' };
			}
		} catch (error) {
			return {
				name,
				success: false,
				error: `Failed to read output directory: ${error}`,
			};
		}
	}

	// For web bundles, just verify the build succeeded
	if (target === 'web') {
		const distDir = join(__dirname, outputDir);
		try {
			const files = await readdir(distDir);
			const jsFile = files.find((f) => f.endsWith('.js'));
			if (!jsFile) {
				return {
					name,
					success: false,
					error: 'No JS file found in output',
				};
			}
			console.log(`  Web bundle created: ${jsFile}`);
		} catch (error) {
			return {
				name,
				success: false,
				error: `Failed to read output directory: ${error}`,
			};
		}
	}

	return { name, success: true };
}

async function main() {
	console.log('=== Bundler Tests (CommonJS) ===');
	console.log(
		'Testing that @php-wasm/* packages can be bundled with Vite from CommonJS\n'
	);

	const results = [];

	// Test 1: Node bundle with require()
	results.push(
		await runTest(
			'Node Bundle (require)',
			'vite.config.node-require.mjs',
			'dist/node-require',
			'node'
		)
	);

	// Test 2: Node bundle with dynamic import() in CJS
	results.push(
		await runTest(
			'Node Bundle (dynamic import in CJS)',
			'vite.config.node-dynamic.mjs',
			'dist/node-dynamic',
			'node'
		)
	);

	// Test 3: Web bundle from CJS require()
	results.push(
		await runTest(
			'Web Bundle (require)',
			'vite.config.web-require.mjs',
			'dist/web-require',
			'web'
		)
	);

	// Print summary
	console.log('\n=== Results ===');
	let allPassed = true;
	for (const result of results) {
		if (result.success) {
			console.log(green(`✓ ${result.name}`));
		} else {
			console.log(red(`✗ ${result.name}: ${result.error}`));
			allPassed = false;
		}
	}

	if (allPassed) {
		console.log(green('\nAll bundler tests passed!'));
	} else {
		console.log(red('\nSome bundler tests failed!'));
		process.exit(1);
	}
}

main();

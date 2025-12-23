/**
 * Runs bundler tests to verify that @php-wasm/* and @wp-playground/* packages
 * can be bundled with Vite for both browser and Node.js targets.
 *
 * This test:
 * 1. Builds each entry point with Vite
 * 2. Loads the bundled output
 * 3. Verifies it doesn't error out
 */
import { spawn } from 'child_process';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface TestResult {
	name: string;
	success: boolean;
	error?: string;
}

function green(text: string): string {
	return `\x1b[32m${text}\x1b[0m`;
}

function red(text: string): string {
	return `\x1b[31m${text}\x1b[0m`;
}

async function runCommand(
	command: string,
	args: string[],
	cwd: string
): Promise<{ code: number; stdout: string; stderr: string }> {
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

async function buildBundle(configFile: string): Promise<boolean> {
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

async function loadNodeBundle(bundlePath: string): Promise<boolean> {
	console.log(`  Loading bundle: ${bundlePath}...`);
	try {
		// Dynamic import the bundled file
		await import(bundlePath);
		console.log(`  Bundle loaded successfully`);
		return true;
	} catch (error) {
		console.error(`  Failed to load bundle:`, error);
		return false;
	}
}

async function runTest(
	name: string,
	configFile: string,
	outputDir: string,
	target: 'node' | 'web'
): Promise<TestResult> {
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
			const jsFile = files.find((f) => f.endsWith('.js'));
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
	// (we can't easily run browser code in Node.js)
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

async function main(): Promise<void> {
	console.log('=== Bundler Tests (ESM) ===');
	console.log('Testing that @php-wasm/* packages can be bundled with Vite\n');

	const results: TestResult[] = [];

	// Test 1: Web bundle with static imports
	results.push(
		await runTest(
			'Web Bundle (static imports)',
			'vite.config.web.ts',
			'dist/web',
			'web'
		)
	);

	// Test 2: Node bundle with static imports
	results.push(
		await runTest(
			'Node Bundle (static imports)',
			'vite.config.node-static.ts',
			'dist/node-static',
			'node'
		)
	);

	// Test 3: Node bundle with dynamic imports
	results.push(
		await runTest(
			'Node Bundle (dynamic imports)',
			'vite.config.node-dynamic.ts',
			'dist/node-dynamic',
			'node'
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

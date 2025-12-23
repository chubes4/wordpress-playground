/**
 * NOTE: We would prefer to run tests in a single process,
 * but we have encountered V8 crashes with both Vitest and the Node.js test runner
 * when calling Playground CLI's runCLI() function multiple times.
 *
 * So here is a manual test runner that spawns a new node test process for each PHP version.
 *
 * !! If we can manage to call runCLI() twice in a row in a process,
 * we might be able to return to using Jest. 🙏
 */
const { SupportedPHPVersions } = require('@php-wasm/universal');
const { spawn } = require('child_process');

function green(text) {
	return `\x1b[32m${text}\x1b[0m`;
}
function red(text) {
	return `\x1b[31m${text}\x1b[0m`;
}

const results = [];
const timeoutMs = Number.parseInt(
	process.env.PER_PHP_TEST_TIMEOUT_MS ?? '60000',
	10
);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
	throw new Error(
		`Invalid PER_PHP_TEST_TIMEOUT_MS value: "${process.env.PER_PHP_TEST_TIMEOUT_MS}"`
	);
}

async function runTests() {
	// Exclude PHP 7.2 and 7.3 – they often time out on CI.
	const phpVersionsToTest = SupportedPHPVersions.filter(
		(phpVersion) => !['7.2', '7.3'].includes(phpVersion)
	);

	for (const phpVersion of phpVersionsToTest) {
		console.log(`\nRunning tests for PHP ${phpVersion}...`);

		const child = spawn(process.execPath, ['./tests/wp.spec.cjs'], {
			env: {
				...process.env,
				PHP_VERSION: phpVersion,
			},
			stdio: 'inherit',
			cwd: __dirname,
		});

		let timeoutHandle;
		const promiseToClose = new Promise((resolve) => {
			child.on('close', (code) => resolve(code));
		});
		const promiseToTimeout = new Promise((_, reject) => {
			timeoutHandle = setTimeout(() => {
				reject(new Error(`Test timed out after ${timeoutMs}ms`));
			}, timeoutMs);
		});

		try {
			const code = await Promise.race([promiseToClose, promiseToTimeout]);
			results.push({
				phpVersion,
				code,
			});
		} catch (e) {
			console.error(`PHP ${phpVersion}: timed out after ${timeoutMs}ms.`);
			results.push({
				phpVersion,
				code: null,
				timeout: true,
			});
			child.kill('SIGKILL');
			await promiseToClose;
		} finally {
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
			}
		}
	}

	console.log('\nResults:');
	for (const result of results) {
		if (result.timeout) {
			console.log(red(`PHP ${result.phpVersion}: ${red('timed out')}.`));
		} else {
			console.log(
				`PHP ${result.phpVersion}: ${
					result.code === 0 ? green('PASS') : red('FAIL')
				} with exit code ${result.code}`
			);
		}
	}

	const numPassed = results.filter((r) => r.code === 0).length;
	const numFailed = results.filter((r) => r.code !== 0 && !r.timeout).length;
	const numTimedOut = results.filter((r) => r.timeout).length;
	if (numPassed > 0) {
		console.log(green(`${numPassed} / ${results.length} tests passed`));
	}
	if (numFailed > 0) {
		console.log(red(`${numFailed} / ${results.length} tests failed`));
	}
	if (numTimedOut > 0) {
		console.log(red(`${numTimedOut} / ${results.length} tests timed out`));
	}

	if (numFailed > 0 || numTimedOut > 0) {
		process.exit(1);
	}
}

runTests();

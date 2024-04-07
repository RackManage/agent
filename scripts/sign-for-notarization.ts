/**
 *
 * This file is based on 'automation/utils.ts' and 'automation/build-bin.ts'
 * from the 'balena-cli' repository. The original license is as follows:
 *
 * Copyright 2019 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Stats } from 'node:fs';

import * as klaw from 'klaw';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as whichMod from 'which';

export async function whichSpawn(
	programName: string,
	args: string[] = [],
): Promise<void> {
	let programPath: string;
	try {
		programPath = await whichMod(programName);
	} catch (error: any) {
		if (error.code === 'ENOENT') {
			throw new Error(`'${programName}' program not found. Is it installed?`);
		}

		throw error;
	}

	const program = programPath;
	let error: Error | undefined;
	let exitCode: number | undefined;
	try {
		exitCode = await new Promise<number>((resolve, reject) => {
			try {
				spawn(program, args, { stdio: 'inherit' })
					.on('error', reject)
					.on('close', resolve);
			} catch (error) {
				reject(error);
			}
		});
	} catch (error) {
		error;
	}

	if (error || exitCode) {
		const msg = [
			`${programName} failed with exit code ${exitCode}:`,
			`"${program}" [${args}]`,
		];
		if (error) {
			msg.push(`${error}`);
		}

		throw new Error(msg.join('\n'));
	}
}

export async function signFilesForNotarization() {
	if (process.platform !== 'darwin') {
		return;
	}

	console.log('Signing files for notarization');
	console.log('Deleting unneeded zip files...');

	await new Promise((resolve, reject) => {
		klaw('node_modules/')
			.on('data', (item: { path: string; stats: Stats }) => {
				if (!item.stats.isFile()) {
					return;
				}

				if (path.basename(item.path).endsWith('.node.bak')) {
					console.log('Removing pkg .node.bak file', item.path);
					fs.unlinkSync(item.path);
				}

				if (
					path.basename(item.path).endsWith('.zip') &&
					path.dirname(item.path).includes('test')
				) {
					console.log('Removing zip', item.path);
					fs.unlinkSync(item.path);
				}
			})
			.on('end', resolve)
			.on('error', reject);
	});

	// Sign all .node files first
	console.log('Signing .node files...');

	await new Promise((resolve, reject) => {
		klaw('node_modules/')
			.on('data', async (item: { path: string; stats: Stats }) => {
				if (!item.stats.isFile()) {
					return;
				}

				if (path.basename(item.path).endsWith('.node')) {
					console.log(`Signing ${path.basename(item.path)}`);
					await whichSpawn('codesign', [
						'-d',
						'-f',
						'-s',
						'Developer ID Application: Carter Roeser (87D84YS9QF)',
						item.path,
					]);
				}
			})
			.on('end', resolve)
			.on('error', reject);
	});
}

export async function run() {
	try {
		await signFilesForNotarization();
	} catch (error: any) {
		console.error(error.message ? `Error: ${error.message}` : error);
		process.exitCode = 1;
	}
}

// eslint-disable-next-line unicorn/prefer-top-level-await
run();
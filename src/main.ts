import { readFileSync, writeFileSync } from 'fs';
import * as core from '@actions/core';

export type Output = {
  sourceName: string;
  sourceVersion: string;
  isBump: boolean;
};

export function update(sourcePath: string, dependentPath: string): Output {
  const source = JSON.parse(readFileSync(`${sourcePath}/package.json`, 'utf8'));
  const dependent = JSON.parse(readFileSync(`${dependentPath}/package.json`, 'utf8'));

  let isBump = false;

  if (dependent['dependencies'][source.name] !== source.version) {
    dependent['dependencies'][source.name] = source.version;
    writeFileSync(`${dependentPath}/package.json`, JSON.stringify(dependent, null, 2), 'utf8');
    isBump = true;
  }

  return {
    sourceName: source.name,
    sourceVersion: source.version,
    isBump,
  };
}

async function run(): Promise<void> {
  try {
    const output = update(core.getInput('source'), core.getInput('dependent'));

    core.setOutput('sourceName', output.sourceName);
    console.log(`sourceName: ${output.sourceName}`);

    core.setOutput('sourceVersion', output.sourceVersion);
    console.log(`sourceVersion: ${output.sourceVersion}`);

    core.setOutput('isBump', output.isBump);
    console.log(`isBump: ${output.isBump}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

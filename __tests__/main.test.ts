import { update } from '../src/main';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

function genPackage(path: string, name: string, version: string, dependencies: { [key: string]: string } = {}) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  writeFileSync(
    `${path}/package.json`,
    JSON.stringify(
      {
        name,
        version,
        dependencies,
      },
      null,
      2,
    ),
    'utf-8',
  );
}

beforeAll(async () => {
  await new Promise((r) => setTimeout(r, 2000));
});

test('should bump source in dependent', () => {
  const srcPath = 'tmp/src';
  const srcName = 'org.visualpinball.src';

  const depPath = 'tmp/dep';
  const depName = 'org.visualpinball.dep';

  genPackage(srcPath, srcName, '0.1.2');

  genPackage(depPath, depName, '0.1.1', {
    [srcName]: '0.1.1',
  });

  const output = update(srcPath, depPath);
  expect(output.isBump).toBe(true);

  const dependent = JSON.parse(readFileSync(`${depPath}/package.json`, 'utf8'));
  expect(dependent.dependencies[srcName]).toBe('0.1.2');
});

test('should not bump source in dependent', () => {
  const srcPath = 'tmp/src';
  const srcName = 'org.visualpinball.src';

  const depPath = 'tmp/dep';
  const depName = 'org.visualpinball.dep';

  genPackage(srcPath, srcName, '0.1.2');

  genPackage(depPath, depName, '0.1.1', {
    [srcName]: '0.1.2',
  });

  const output = update(srcPath, depPath);
  expect(output.isBump).toBe(false);

  const dependent = JSON.parse(readFileSync(`${depPath}/package.json`, 'utf8'));
  expect(dependent.dependencies[srcName]).toBe('0.1.2');
});

test('should add source if not in dependent', () => {
  const srcPath = 'tmp/src';
  const srcName = 'org.visualpinball.src';

  const depPath = 'tmp/dep';
  const depName = 'org.visualpinball.dep';

  genPackage(srcPath, srcName, '0.1.3');
  genPackage(depPath, depName, '0.1.1');

  const output = update(srcPath, depPath);
  expect(output.isBump).toBe(true);

  const dependent = JSON.parse(readFileSync(`${depPath}/package.json`, 'utf8'));
  expect(dependent.dependencies[srcName]).toBe('0.1.3');
});

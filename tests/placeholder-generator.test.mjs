import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const generator = path.resolve('scripts/generate_placeholders.py');

test('generator reproduces all SVG illustrations from any cwd without changing catalog or mapping', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'spelhyllan-art-'));
  const protectedFiles = [
    'src/games.json',
    'src/data/placeholder-manifest.json',
  ];
  const before = protectedFiles.map((file) => fs.readFileSync(file));
  try {
    const output = path.join(temporary, 'images');
    const preview = path.join(temporary, 'preview.svg');
    const result = spawnSync(
      'python3',
      [generator, '--output-dir', output, '--preview', preview],
      { cwd: temporary, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(before[1]);
    let count = 0;
    for (const theme of Object.values(manifest.themes)) {
      for (const kind of ['cover', 'scene', 'detail']) {
        const relative = theme[kind].replace('/images/placeholders/v2/', '');
        const generated = fs.readFileSync(path.join(output, relative));
        assert.deepEqual(
          generated,
          fs.readFileSync(`public${theme[kind]}`),
          relative,
        );
        count += 1;
      }
    }
    assert.equal(count, 216);
    assert(fs.readFileSync(preview, 'utf8').includes('<svg'));
    assert.equal(
      fs.readdirSync(temporary).sort().join(','),
      'images,preview.svg',
    );
    for (let i = 0; i < protectedFiles.length; i++)
      assert.deepEqual(fs.readFileSync(protectedFiles[i]), before[i]);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('generator rejects a JSON preview target before writing images or replacing existing data', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'spelhyllan-art-'));
  try {
    const target = path.join(temporary, 'placeholder-manifest.json');
    const sentinel = '{"games":{"keep":"my-theme"}}\n';
    fs.writeFileSync(target, sentinel);
    const result = spawnSync(
      'python3',
      [
        generator,
        '--output-dir',
        path.join(temporary, 'images'),
        '--preview',
        target,
      ],
      { encoding: 'utf8' },
    );
    assert.notEqual(result.status, 0);
    assert.equal(fs.readFileSync(target, 'utf8'), sentinel);
    assert(!fs.existsSync(path.join(temporary, 'images')));
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

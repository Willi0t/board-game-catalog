import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transpileModule, ModuleKind, JsxEmit } from 'typescript';
import games from '../src/games.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const modules = new Map();
// Render these leaf components without a browser or a new test dependency.
// CSS is checked by Prettier/build and browser inspection, not by these tests.
async function loadComponent(filename) {
  const fullPath = path.resolve(filename);
  if (modules.has(fullPath)) return modules.get(fullPath);
  let code = transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    fileName: fullPath,
    compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
  }).outputText;
  code = code.replace(
    /import styles from ['"][^'"]+\.module\.css['"];?/g,
    'const styles = {};',
  );
  for (const match of [...code.matchAll(/from ["']([^"']+)["']/g)]) {
    const specifier = match[1];
    const resolved = specifier.startsWith('.')
      ? await loadComponent(
          path.resolve(path.dirname(fullPath), `${specifier}.tsx`),
        )
      : pathToFileURL(require.resolve(specifier)).href;
    code = code.replace(match[0], `from ${JSON.stringify(resolved)}`);
  }
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  modules.set(fullPath, url);
  return url;
}
const component = async (filename) =>
  (await import(await loadComponent(filename))).default;
const GameDescription = await component(
  'src/components/GameDescription/GameDescription.tsx',
);
const GameEditionDetails = await component(
  'src/components/GameEditionDetails/GameEditionDetails.tsx',
);
const PickerOption = await component(
  'src/components/PickerOption/PickerOption.tsx',
);
const render = (Component, props) =>
  renderToStaticMarkup(createElement(Component, props));

test('mobile and full descriptions prefer long text and retain draft caveats; summaries stay short', () => {
  const game = {
    ...games[0],
    description: 'Kort text',
    longDescription: 'Lång text',
    descriptionStatus: 'draft',
  };
  for (const presentation of ['mobile', 'full']) {
    const html = render(GameDescription, { game, presentation });
    assert(html.includes('Lång text'));
    assert(!html.includes('Kort text'));
    assert(html.includes('Beskrivningen är ett utkast.'));
  }
  assert(render(GameDescription, { game }).includes('Kort text'));
  assert(
    render(GameDescription, {
      game: { ...game, longDescription: '' },
      presentation: 'mobile',
    }).includes('Kort text'),
  );
  assert.equal(
    render(GameDescription, {
      game: { ...game, description: '', longDescription: '' },
      presentation: 'full',
    }),
    '',
  );
});

test('shared edition sections preserve real edition/expansion text and omit absent information', () => {
  const game = {
    ...games[0],
    edition: 'Min utgåva',
    expansions: ['Expansion A', 'Expansion B'],
  };
  const html = render(GameEditionDetails, { game });
  for (const text of [
    'Min utgåva',
    'Expansioner',
    'Expansion A',
    'Expansion B',
  ])
    assert(html.includes(text));
  assert.equal(
    render(GameEditionDetails, {
      game: { ...game, edition: '', expansions: [] },
    }),
    '',
  );
});

test('counted checkbox disables only unselected zero options and keeps selected zeros removable', () => {
  for (const [count, checked, disabled] of [
    [0, false, true],
    [0, true, false],
    [2, false, false],
    [2, true, false],
  ]) {
    const html = render(PickerOption, {
      label: 'Medel',
      count,
      checked,
      onChange: () => {},
    });
    assert.equal(html.includes('disabled=""'), disabled);
    assert.equal(html.includes('checked=""'), checked);
    assert(html.includes(`${count} spel`));
    assert.equal(html.includes('matchar inte'), checked && count === 0);
    assert.equal(html.includes('aria-invalid="true"'), checked && count === 0);
  }
});

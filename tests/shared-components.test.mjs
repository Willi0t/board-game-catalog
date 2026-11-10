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
          path.resolve(
            path.dirname(fullPath),
            `${specifier}${fs.existsSync(path.resolve(path.dirname(fullPath), `${specifier}.tsx`)) ? '.tsx' : '.ts'}`,
          ),
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
const ExploreNavigation = await component(
  'src/components/ExploreNavigation/ExploreNavigation.tsx',
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

test('Explore shows five mechanics and reveals all mechanics then types for hidden selections', () => {
  const options = Array.from({ length: 7 }, (_, index) => ({
    tag: `Mechanic ${index + 1}`,
    count: 10 - index,
  }));
  const props = {
    mechanics: options,
    gameTypes: [{ tag: 'Competitive', count: 3 }],
    gameType: '',
    mechanic: '',
    onGameTypeChange: () => {},
    onMechanicChange: () => {},
  };
  const collapsed = render(ExploreNavigation, props);
  assert(collapsed.includes('Spelmekanik'));
  assert(collapsed.includes('Mechanic 5'));
  assert(!collapsed.includes('Mechanic 6'));
  assert(!collapsed.includes('Speltyp'));
  assert(collapsed.includes('aria-expanded="false"'));
  assert(collapsed.includes('Visa fler'));
  const listId = collapsed.match(/<div id="([^"]+)"/)[1];
  assert(collapsed.includes(`aria-controls="${listId}"`));
  const visibleSelection = render(ExploreNavigation, {
    ...props,
    mechanic: 'Mechanic 1',
  });
  assert(visibleSelection.includes('aria-expanded="false"'));
  for (const selection of [
    { mechanic: 'Mechanic 7' },
    { gameType: 'Competitive' },
  ]) {
    const expanded = render(ExploreNavigation, { ...props, ...selection });
    assert(expanded.includes('Mechanic 7'));
    assert(expanded.includes('Competitive'));
    assert(expanded.indexOf('Spelmekanik') < expanded.indexOf('Speltyp'));
    assert(expanded.includes('aria-expanded="true"'));
    assert(expanded.includes('aria-pressed="true"'));
    assert(expanded.includes('Visa färre'));
  }
});

test('shared game type badges show every type and omit missing types without a category fallback', async () => {
  const GameTypeBadges = await component(
    'src/components/GameTypeBadges/GameTypeBadges.tsx',
  );
  const html = render(GameTypeBadges, {
    gameTypes: ['Competitive', 'Party', 'Social'],
  });
  assert(html.includes('aria-label="Speltyper"'));
  for (const tag of ['Competitive', 'Party', 'Social'])
    assert(html.includes(`<li>${tag}</li>`));
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.equal(render(GameTypeBadges, { gameTypes: [] }), '');
});

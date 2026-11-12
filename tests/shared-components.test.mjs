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
const ImageModal = await component('src/components/ImageModal/ImageModal.tsx');
const { getBannerMask } = await import(
  await loadComponent('src/utils/bannerMask.ts')
);
const { getCarouselNeighbors } = await import(
  await loadComponent('src/utils/carouselNeighbors.ts')
);
const render = (Component, props) =>
  renderToStaticMarkup(createElement(Component, props));

test('banner masks start at the contained image edges, on the axis with visible background', () => {
  assert.equal(
    getBannerMask(400, 300, 800, 280),
    'linear-gradient(to bottom, transparent 80px, #000 86px, #000 214px, transparent 220px)',
  );
  assert.equal(
    getBannerMask(400, 300, 200, 300),
    'linear-gradient(to right, transparent 100px, #000 106px, #000 294px, transparent 300px)',
  );
  assert.equal(getBannerMask(400, 300, 800, 600), undefined);
  assert.equal(getBannerMask(0, 300, 800, 600), undefined);
  assert.equal(getBannerMask(400, 300, 0, 0), undefined);
});

test('carousel layers select unique nearest images, including wrapping and small galleries', () => {
  for (let count = 1; count <= 8; count++) {
    for (let current = 0; current < count; current++) {
      const neighbors = getCarouselNeighbors(count, current);
      assert.equal(neighbors.length, Math.min(count - 1, 4));
      assert.equal(
        new Set(neighbors.map((item) => item.index)).size,
        neighbors.length,
      );
      assert(
        neighbors.every(
          (item) =>
            item.index !== current && item.index >= 0 && item.index < count,
        ),
      );
    }
  }
  assert.deepEqual(getCarouselNeighbors(5, 1), [
    { index: 0, offset: -1 },
    { index: 2, offset: 1 },
    { index: 4, offset: -2 },
    { index: 3, offset: 2 },
  ]);
});

test('image dialog starts on the selected thumbnail and hides navigation for a single image', () => {
  const images = ['Första', 'Andra', 'Tredje'].map((title, index) => ({
    title,
    src: `/images/test-${index}.png`,
    placeholderSrc: '/images/fallback.svg',
    kind: 'detail',
    gameId: 'any-game',
    gameTitle: 'Testspel',
    alt: `${title} motiv`,
  }));
  const props = {
    modal: images[1],
    images,
    onClose() {},
    openerRef: { current: null },
    fallbackRef: { current: null },
  };
  const html = render(ImageModal, props);
  assert(html.includes('aria-label="Andra"'));
  assert(html.includes('src="/images/test-1.png"'));
  assert(html.includes('2 av 3'));
  assert(html.includes('aria-label="Föregående bild"'));
  assert(html.includes('aria-label="Nästa bild"'));
  assert(html.includes('aria-label="Visa föregående bild: Första"'));
  assert(html.includes('aria-label="Visa nästa bild: Tredje"'));
  const twoHtml = render(ImageModal, { ...props, images: images.slice(0, 2) });
  assert(!twoHtml.includes('Visa föregående bild:'));
  assert(twoHtml.includes('aria-label="Visa nästa bild: Första"'));
  assert.equal((twoHtml.match(/src="\/images\/test-0.png"/g) ?? []).length, 1);
  const five = [
    ...images,
    ...['Fjärde', 'Femte'].map((title, index) => ({
      ...images[0],
      title,
      src: `/images/test-${index + 3}.png`,
    })),
  ];
  const fiveHtml = render(ImageModal, { ...props, images: five });
  assert.equal((fiveHtml.match(/data-depth="1"/g) ?? []).length, 2);
  assert.equal((fiveHtml.match(/data-depth="2"/g) ?? []).length, 2);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (fiveHtml.match(new RegExp(`src="/images/test-${i}.png"`, 'g')) ?? [])
        .length,
      1,
    );
  for (const single of [undefined, [], [images[1]]]) {
    const singleHtml = render(ImageModal, { ...props, images: single });
    assert(singleHtml.includes('src="/images/test-1.png"'));
    assert(!singleHtml.includes('Bläddra bland bilder'));
  }
});

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

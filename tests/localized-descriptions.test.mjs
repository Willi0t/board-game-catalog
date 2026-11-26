import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSync } from 'esbuild';
import games from '../src/games.json' with { type: 'json' };
import matches from '../scripts/catalog-matches.json' with { type: 'json' };

const code = buildSync({
  entryPoints: ['src/utils/localizedDescription.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
}).outputFiles[0].text;
const { default: description } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);
const ids = matches.slice(0, 10).map(({ id }) => id);
const paragraphs = (text) => text.split(/\r?\n(?:[^\S\r\n]*\r?\n)+/);

test('all 40 translations use the first ten stable IDs and preserve paragraphs and numeric examples', () => {
  for (const language of ['sv', 'fr', 'de', 'es']) {
    const translations = JSON.parse(
      fs.readFileSync(`src/data/descriptions/${language}.json`, 'utf8'),
    );
    assert.deepEqual(Object.keys(translations).sort(), [...ids].sort());
    for (const id of ids) {
      const game = games.find((game) => game.id === id);
      const result = description(game, language, 'full');
      assert.equal(result.text, translations[id]);
      assert.equal(result.language, language);
      assert.equal(
        paragraphs(result.text).length,
        paragraphs(game.description).length,
      );
      assert.deepEqual(
        result.text.match(/\d+/g),
        game.description.match(/\d+/g),
      );
    }
  }
});

test('missing translations use English and long descriptions keep their own source text', () => {
  const game = games.find(({ id }) => id === 'terraforming');
  for (const language of ['sv', 'en', 'fr', 'de', 'es']) {
    assert.deepEqual(description(game, language, 'full'), {
      text: game.description,
      language: 'en',
    });
  }
  const salad = games.find(({ id }) => id === 'salad');
  assert.equal(description(salad, 'en', 'summary').text, salad.description);
  assert.deepEqual(
    description(
      { ...salad, longDescription: 'Separate long text' },
      'fr',
      'full',
    ),
    { text: 'Separate long text', language: 'en' },
  );
  const spies = games.find(({ id }) => id === 'spies-lies-supplies');
  assert.equal(description(spies, 'en', 'full').language, 'en');
  assert.equal(description(spies, 'en', 'full').text, spies.description);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSync } from 'esbuild';
import games from '../src/games.json' with { type: 'json' };

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
const translatedGames = games.filter((game) => game.catalogMetadata.sourceRow <= 51);
const ids = translatedGames.map(({ id }) => id);
const paragraphs = (text) => text.split(/\r?\n(?:[^\S\r\n]*\r?\n)+/);

test('every catalog game has descriptions in English and all four target languages', () => {
  for (const game of games) {
    assert.equal(game.descriptionLanguage, 'en', game.id);
    assert.ok(game.description.trim(), game.id);
  }
  for (const language of ['sv', 'fr', 'de', 'es']) {
    const translations = JSON.parse(
      fs.readFileSync(`src/data/descriptions/${language}.json`, 'utf8'),
    );
    assert.deepEqual(Object.keys(translations).sort(), [...ids].sort());
    for (const game of translatedGames) {
      const { id } = game;
      assert.ok(translations[id]?.trim(), `${language}: ${id}`);
      const result = description(game, language, 'full');
      assert.equal(result.text, translations[id]);
      assert.equal(result.language, language);
      assert.equal(
        paragraphs(result.text).length,
        paragraphs(game.description).length,
      );
    }
  }
});

test('missing translations use English and long descriptions keep their own source text', () => {
  const game = {
    ...games.find(({ id }) => id === 'high-society'),
    id: 'untranslated-test-fixture',
    description: 'English source text',
    descriptionLanguage: 'en',
  };
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

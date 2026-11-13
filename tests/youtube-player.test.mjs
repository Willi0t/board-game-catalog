import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';

let instance = 0;
async function setup(t) {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const scripts = [];
  let timeout;
  globalThis.window = {
    setTimeout: (callback) => {
      timeout = callback;
      return 1;
    },
    clearTimeout: () => {},
  };
  globalThis.document = {
    createElement: () => ({
      remove() {
        this.removed = true;
      },
    }),
    head: { append: (script) => scripts.push(script) },
  };
  t.after(() => {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  });
  const source = fs.readFileSync('src/utils/youtubePlayer.ts', 'utf8');
  const code = transpileModule(source, {
    compilerOptions: { module: ModuleKind.ESNext },
  }).outputText;
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(`${code}\n// ${instance++}`).toString('base64')}`
  );
  return { ...module, scripts, expire: () => timeout() };
}

test('concurrent banners share one API request and preserve an existing ready callback', async (t) => {
  const { loadYouTubeAPI, scripts } = await setup(t);
  let previousCalls = 0;
  globalThis.window.onYouTubeIframeAPIReady = () => previousCalls++;
  const first = loadYouTubeAPI();
  assert.equal(loadYouTubeAPI(), first);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://www.youtube.com/iframe_api');
  globalThis.window.YT = { Player: class {} };
  globalThis.window.onYouTubeIframeAPIReady();
  assert.equal(await first, globalThis.window.YT);
  assert.equal(previousCalls, 1);
  assert.equal(await loadYouTubeAPI(), globalThis.window.YT);
  assert.equal(scripts.length, 1);
});

test('failed API requests are removed and can be retried', async (t) => {
  const { loadYouTubeAPI, scripts } = await setup(t);
  const first = loadYouTubeAPI();
  scripts[0].onerror();
  await assert.rejects(first, /kunde inte laddas/);
  assert.equal(scripts[0].removed, true);
  const retry = loadYouTubeAPI();
  assert.equal(scripts.length, 2);
  globalThis.window.YT = { Player: class {} };
  globalThis.window.onYouTubeIframeAPIReady();
  assert.equal(await retry, globalThis.window.YT);
});

test('an API that never becomes ready times out for static fallback', async (t) => {
  const { loadYouTubeAPI, scripts, expire } = await setup(t);
  const pending = loadYouTubeAPI();
  expire();
  await assert.rejects(pending, /kunde inte laddas/);
  assert.equal(scripts[0].removed, true);
});

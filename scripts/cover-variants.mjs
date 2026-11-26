import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const widths = [192, 384, 768, 896];

async function writeAtomically(filename, content) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, content);
    await fs.rename(temporary, filename);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

async function syncCover(game, publicRoot, check) {
  const { cover, id } = game;
  const variants = [];
  if (cover) {
    const folder = `/images/games/${id}/`;
    const basename = cover.slice(folder.length);
    if (
      !/^[a-z0-9-]+$/.test(id) ||
      !cover.startsWith(folder) ||
      !/^[\w.-]+\.(png|jpe?g|webp|avif|svg)$/i.test(basename)
    )
      throw new Error('Omslaget måste ligga i spelets bildmapp.');

    const original = sharp(await fs.readFile(publicRoot + cover));
    const metadata = await original.metadata();
    const { width, height } = metadata.autoOrient;
    if (metadata.format !== 'svg') {
      if (metadata.pages > 1)
        throw new Error('Använd en stillbild som omslag.');

      const stem = cover.slice(0, cover.lastIndexOf('.'));
      for (const targetWidth of widths.filter((size) => size < width)) {
        const src = `${stem}-${targetWidth}.webp`;
        const filename = publicRoot + src;
        variants.push({ src, width: targetWidth });
        if (check) {
          const variant = await sharp(filename).metadata();
          if (
            variant.format !== 'webp' ||
            variant.width !== targetWidth ||
            variant.height !==
              Math.max(1, Math.round((height * targetWidth) / width))
          )
            throw new Error(`Fel format eller pixelmått för ${src}.`);
        } else {
          const output = await original
            .clone()
            .autoOrient()
            .resize({ width: targetWidth, kernel: sharp.kernel.lanczos3 })
            .sharpen({ sigma: 0.6 })
            .webp({ quality: 95, smartSubsample: true, effort: 6 })
            .toBuffer();
          const existing = await fs.readFile(filename).catch((error) => {
            if (error.code !== 'ENOENT') throw error;
          });
          if (!existing?.equals(output))
            await writeAtomically(filename, output);
        }
      }
      variants.push({ src: cover, width });
    }
  }
  if (check) {
    const current = game.coverVariants ?? [];
    if (
      current.length !== variants.length ||
      variants.some(
        ({ src, width }, index) =>
          current[index]?.src !== src || current[index]?.width !== width,
      )
    )
      throw new Error('coverVariants stämmer inte med omslaget.');
  } else if (variants.length) {
    game.coverVariants = variants;
  } else {
    delete game.coverVariants;
  }
}

async function run(args) {
  const [arg] = args;
  if (args.length > 1 || (arg?.startsWith('-') && arg !== '--check'))
    throw new Error(
      'Användning: node scripts/cover-variants.mjs [spel-id | --check]',
    );
  const check = arg === '--check';
  const filename = path.join(root, 'src/games.json');
  const before = await fs.readFile(filename, 'utf8');
  const games = JSON.parse(before);
  const selected = arg && !check ? games.filter(({ id }) => id === arg) : games;
  if (!selected.length) throw new Error(`Spelet ${arg} saknas.`);

  for (const game of selected) {
    try {
      await syncCover(game, path.join(root, 'public'), check);
    } catch (error) {
      throw new Error(
        `${game.id}: ${error.message}${check ? ` Kör npm run covers:generate -- ${game.id}.` : ''}`,
        { cause: error },
      );
    }
  }

  if (!check) {
    const after = await format(JSON.stringify(games), {
      ...(await resolveConfig(filename)),
      parser: 'json',
    });
    if ((await fs.readFile(filename, 'utf8')) !== before)
      throw new Error('Speldata ändrades under körningen. Kör igen.');
    if (after !== before) await writeAtomically(filename, after);
  }
  const count = selected.filter(
    ({ coverVariants }) => coverVariants?.length,
  ).length;
  console.log(
    `${count} omslag med responsiva källor ${check ? 'kontrollerade' : 'genererade'}.`,
  );
}

try {
  await run(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

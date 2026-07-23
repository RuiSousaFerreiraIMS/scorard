// Gera os ícones PWA a partir de scripts/icon.svg.
// Correr: npm run icons  (precisa de sharp, que é devDependency)
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const svgPath = resolve(here, 'icon.svg');
const outDir = resolve(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath);

const BG = '#0F1714';

async function render(size, file, { pad = 0, flatten = true } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  let img = sharp(svg).resize(inner, inner);
  if (pad > 0) {
    const border = Math.round((size - inner) / 2);
    img = img.extend({
      top: border,
      bottom: border,
      left: border,
      right: border,
      background: BG,
    });
  }
  if (flatten) img = img.flatten({ background: BG });
  await img.png().toFile(resolve(outDir, file));
  console.log('  ✓', file, `${size}×${size}`);
}

console.log('A gerar ícones em public/icons/ …');
await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
// maskable: safe zone → conteúdo com ~12% de margem à volta
await render(512, 'maskable-512.png', { pad: 0.12 });
await render(180, 'apple-touch-icon.png');
console.log('Feito.');

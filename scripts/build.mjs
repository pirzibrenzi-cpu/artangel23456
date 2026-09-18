// Production build for Freebuff hosting: emits a static site into dist/ and exits.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

mkdirSync(dist, { recursive: true });
cpSync(path.join(root, 'index.html'), path.join(dist, 'index.html'));

// Copy asset folders automatically as the project grows.
for (const dir of ['assets', 'images', 'fonts', 'css', 'js']) {
  const src = path.join(root, dir);
  if (existsSync(src)) cpSync(src, path.join(dist, dir), { recursive: true });
}

console.log('✓ Built static site into dist/');

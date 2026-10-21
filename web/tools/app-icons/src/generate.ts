import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  brand,
  iconBackgroundSvg,
  iconForegroundSvg,
  iconMaskableSvg,
  iconOnlySvg,
  iconRoundedSvg,
  SPLASH_VIEW_BOX,
  splashSvg,
} from './brand-mark.ts';

const ICON_SIZE = 1024;
const RENDER_DENSITY = 384;

const toolDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nativeDir = path.resolve(toolDir, '../../apps/club-app/assets');
const webDir = path.resolve(toolDir, '../../apps/club-app/public');

type RenderTarget = {
  readonly dir: string;
  readonly name: string;
  readonly svg: string;
  readonly size: number;
};

const targets: readonly RenderTarget[] = [
  { dir: nativeDir, name: 'icon-only.png', svg: iconOnlySvg, size: ICON_SIZE },
  { dir: nativeDir, name: 'icon-background.png', svg: iconBackgroundSvg, size: ICON_SIZE },
  { dir: nativeDir, name: 'icon-foreground.png', svg: iconForegroundSvg, size: ICON_SIZE },
  { dir: nativeDir, name: 'splash.png', svg: splashSvg(brand.splashLight), size: SPLASH_VIEW_BOX },
  {
    dir: nativeDir,
    name: 'splash-dark.png',
    svg: splashSvg(brand.splashDark),
    size: SPLASH_VIEW_BOX,
  },
  { dir: webDir, name: 'app-icon-192.png', svg: iconRoundedSvg, size: 192 },
  { dir: webDir, name: 'app-icon-512.png', svg: iconRoundedSvg, size: 512 },
  { dir: webDir, name: 'app-icon-maskable-512.png', svg: iconMaskableSvg, size: 512 },
  { dir: webDir, name: 'apple-touch-icon.png', svg: iconOnlySvg, size: 180 },
];

const render = async ({ dir, name, svg, size }: RenderTarget): Promise<void> => {
  await sharp(Buffer.from(svg), { density: RENDER_DENSITY })
    .resize(size, size)
    .png()
    .toFile(path.join(dir, name));
  process.stdout.write(`${name} ${size}x${size}\n`);
};

await mkdir(nativeDir, { recursive: true });

for (const target of targets) {
  await render(target);
}

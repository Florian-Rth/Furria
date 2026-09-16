import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  brand,
  iconBackgroundSvg,
  iconForegroundSvg,
  iconOnlySvg,
  SPLASH_VIEW_BOX,
  splashSvg,
} from './brand-mark.ts';

const ICON_SIZE = 1024;
const RENDER_DENSITY = 384;

const toolDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.resolve(toolDir, '../../apps/club-app/assets');

type RenderTarget = {
  readonly name: string;
  readonly svg: string;
  readonly size: number;
};

const targets: readonly RenderTarget[] = [
  { name: 'icon-only.png', svg: iconOnlySvg, size: ICON_SIZE },
  { name: 'icon-background.png', svg: iconBackgroundSvg, size: ICON_SIZE },
  { name: 'icon-foreground.png', svg: iconForegroundSvg, size: ICON_SIZE },
  { name: 'splash.png', svg: splashSvg(brand.splashLight), size: SPLASH_VIEW_BOX },
  { name: 'splash-dark.png', svg: splashSvg(brand.splashDark), size: SPLASH_VIEW_BOX },
];

const render = async ({ name, svg, size }: RenderTarget): Promise<void> => {
  await sharp(Buffer.from(svg), { density: RENDER_DENSITY })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, name));
  process.stdout.write(`${name} ${size}x${size}\n`);
};

await mkdir(outDir, { recursive: true });

for (const target of targets) {
  await render(target);
}

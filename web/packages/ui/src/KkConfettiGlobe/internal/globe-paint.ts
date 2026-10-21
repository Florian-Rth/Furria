import type { KkResolvedColorScheme } from '../../theme-color';
import { kkTokens } from '../../tokens';
import type { GlobeWorld } from './globe-world';
import { GLOBE_INK_COUNT, GLOBE_SHAPES } from './globe-world';

const STRIP_CORNER = 0.8;
const THINNEST = 0.06;
const LYING = 0.55;
const FRONT = 0.92;
const BACK = 0.7;
const HALF = 0.5;
const TRIANGLE_RISE = Math.sqrt(3) / 2;

export const globeInksOf = (scheme: KkResolvedColorScheme): readonly string[] => {
  const color = kkTokens.color[scheme];
  return [color.red, color.gold, color.ink];
};

const squashOf = (facing: number): number =>
  (facing < 0 ? -1 : 1) * Math.max(Math.abs(facing), THINNEST);

const outline = (
  context: CanvasRenderingContext2D,
  shape: number,
  length: number,
  thickness: number,
): void => {
  context.beginPath();
  if (shape === GLOBE_SHAPES.dot) {
    context.arc(0, 0, length * HALF, 0, Math.PI * 2);
  } else if (shape === GLOBE_SHAPES.triangle) {
    const rise = length * TRIANGLE_RISE;
    context.moveTo(0, -rise * HALF);
    context.lineTo(length * HALF, rise * HALF);
    context.lineTo(-length * HALF, rise * HALF);
    context.closePath();
  } else if (shape === GLOBE_SHAPES.strip) {
    context.roundRect(-length * HALF, -thickness * HALF, length, thickness, STRIP_CORNER);
  } else {
    context.rect(-length * HALF, -thickness * HALF, length, thickness);
  }
  context.fill();
};

export const paintGlobe = (
  context: CanvasRenderingContext2D,
  world: GlobeWorld,
  inks: readonly string[],
  ratio: number,
): void => {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (let ink = 0; ink < GLOBE_INK_COUNT; ink += 1) {
    context.fillStyle = inks[ink] ?? 'transparent';
    for (let index = 0; index < world.count; index += 1) {
      if (world.ink[index] !== ink) {
        continue;
      }
      const spin = world.spin[index] ?? 0;
      const lie = world.lie[index] ?? 0;
      const across = squashOf(Math.cos(world.flipY[index] ?? 0));
      const along = squashOf(Math.cos(world.flipX[index] ?? 0));
      const tall = along + ((along < 0 ? -LYING : LYING) - along) * lie;
      const wide = across * ratio;
      const high = tall * ratio;
      const cos = Math.cos(spin);
      const sin = Math.sin(spin);
      context.globalAlpha = across * tall < 0 ? BACK : FRONT;
      context.setTransform(
        cos * wide,
        sin * wide,
        -sin * high,
        cos * high,
        (world.x[index] ?? 0) * ratio,
        (world.y[index] ?? 0) * ratio,
      );
      outline(
        context,
        world.shape[index] ?? GLOBE_SHAPES.strip,
        world.length[index] ?? 0,
        world.thickness[index] ?? 0,
      );
    }
  }
  context.globalAlpha = 1;
};

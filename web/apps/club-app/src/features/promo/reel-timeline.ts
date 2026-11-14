import type { KkPromoCut, KkPromoQrPose, KkPromoScenePhase } from '@furria/ui/promo-stage-types';

export const REEL_SCENE_KEYS = [
  'opener',
  'start',
  'calendar',
  'event',
  'dance',
  'gallery',
  'website',
  'beer',
  'finale',
] as const;
export type ReelSceneKey = (typeof REEL_SCENE_KEYS)[number];

export interface ReelScene {
  key: ReelSceneKey;
  ms: number;
  cut: KkPromoCut;
}

export interface ReelPosition {
  loop: number;
  index: number;
  sceneMs: number;
}

export interface ReelSlot {
  scene: ReelScene;
  phase: KkPromoScenePhase;
  cut: KkPromoCut;
}

const SCENE_MS = 20000;
const FINALE_MS = 10000;

const REEL: readonly ReelScene[] = [
  { key: 'opener', ms: 4000, cut: 'hard' },
  { key: 'start', ms: SCENE_MS, cut: 'mask' },
  { key: 'calendar', ms: SCENE_MS, cut: 'match' },
  { key: 'event', ms: SCENE_MS, cut: 'hard' },
  { key: 'dance', ms: SCENE_MS, cut: 'whip' },
  { key: 'gallery', ms: SCENE_MS, cut: 'mask' },
  { key: 'website', ms: SCENE_MS, cut: 'wipe' },
  { key: 'beer', ms: SCENE_MS, cut: 'hard' },
  { key: 'finale', ms: FINALE_MS, cut: 'match' },
];

const LATER_LOOP_OPENING_CUT: KkPromoCut = 'whip';
export const REEL_LEAVE_MS = 1000;
const QR_DOCK_LEAD_MS = 850;

export const reelScenesOf = (firstLoop: boolean): ReelScene[] => {
  if (firstLoop) {
    return [...REEL];
  }

  const [, opening, ...rest] = REEL;

  return opening === undefined ? [] : [{ ...opening, cut: LATER_LOOP_OPENING_CUT }, ...rest];
};

const loopMsOf = (scenes: readonly ReelScene[]): number =>
  scenes.reduce((total, scene) => total + scene.ms, 0);

export const reelPositionOf = (
  elapsedMs: number,
  firstLoop: readonly ReelScene[],
  laterLoop: readonly ReelScene[],
): ReelPosition => {
  const firstMs = loopMsOf(firstLoop);
  const laterMs = loopMsOf(laterLoop);
  const inFirst = elapsedMs < firstMs || laterMs === 0;
  const loop = inFirst ? 0 : 1 + Math.floor((elapsedMs - firstMs) / laterMs);
  const scenes = inFirst ? firstLoop : laterLoop;
  let rest = inFirst ? elapsedMs % Math.max(firstMs, 1) : (elapsedMs - firstMs) % laterMs;

  for (const [index, scene] of scenes.entries()) {
    if (rest < scene.ms) {
      return { loop, index, sceneMs: rest };
    }
    rest -= scene.ms;
  }

  return { loop, index: 0, sceneMs: 0 };
};

const previousSceneOf = (
  position: ReelPosition,
  scenes: readonly ReelScene[],
  laterLoop: readonly ReelScene[],
): ReelScene | undefined => {
  if (position.index > 0) {
    return scenes[position.index - 1];
  }

  return position.loop === 0 ? undefined : laterLoop[laterLoop.length - 1];
};

export const reelSlotsOf = (
  position: ReelPosition,
  firstLoop: readonly ReelScene[],
  laterLoop: readonly ReelScene[],
): ReelSlot[] => {
  const scenes = position.loop === 0 ? firstLoop : laterLoop;
  const current = scenes[position.index];

  if (current === undefined) {
    return [];
  }

  const lastOfLoop = position.index === scenes.length - 1;
  const next = lastOfLoop ? laterLoop[0] : scenes[position.index + 1];
  const previous = previousSceneOf(position, scenes, laterLoop);
  const slots: ReelSlot[] = [];

  if (previous !== undefined && previous.key !== current.key && position.sceneMs < REEL_LEAVE_MS) {
    slots.push({ scene: previous, phase: 'leaving', cut: current.cut });
  }
  slots.push({ scene: current, phase: 'live', cut: current.cut });

  if (next !== undefined && next.key !== current.key) {
    slots.push({ scene: next, phase: 'waiting', cut: next.cut });
  }

  return slots;
};

export const reelQrPoseOf = (
  position: ReelPosition,
  firstLoop: readonly ReelScene[],
  laterLoop: readonly ReelScene[],
): KkPromoQrPose => {
  const scene = (position.loop === 0 ? firstLoop : laterLoop)[position.index];

  if (scene?.key === 'finale') {
    return position.sceneMs < scene.ms - QR_DOCK_LEAD_MS ? 'hero' : 'corner';
  }

  return position.loop === 0 ? 'away' : 'corner';
};

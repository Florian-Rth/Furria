export interface SceneFrame {
  id: number;
  capturedAt: string | null;
}

export interface GalleryScene<TFrame extends SceneFrame> {
  index: number;
  firstNumber: number;
  lastNumber: number;
  startsAt: string | null;
  endsAt: string | null;
  frames: TFrame[];
}

export const SCENE_GAP_SECONDS = 90;
export const UNTIMED_BLOCK_SIZE = 100;

const MILLISECONDS = 1000;

const secondsBetween = (earlier: string, later: string): number =>
  (Date.parse(later) - Date.parse(earlier)) / MILLISECONDS;

const opensScene = (
  previous: SceneFrame | undefined,
  frame: SceneFrame,
  count: number,
): boolean => {
  if (previous === undefined) {
    return true;
  }
  if (previous.capturedAt === null || frame.capturedAt === null) {
    return count % UNTIMED_BLOCK_SIZE === 0;
  }
  return secondsBetween(previous.capturedAt, frame.capturedAt) >= SCENE_GAP_SECONDS;
};

export const scenesOf = <TFrame extends SceneFrame>(
  frames: readonly TFrame[],
): GalleryScene<TFrame>[] => {
  const scenes: GalleryScene<TFrame>[] = [];
  let previous: TFrame | undefined;

  frames.forEach((frame, position) => {
    const current = scenes.at(-1);
    const count = current === undefined ? 0 : current.frames.length;
    if (current === undefined || opensScene(previous, frame, count)) {
      scenes.push({
        index: scenes.length + 1,
        firstNumber: position + 1,
        lastNumber: position + 1,
        startsAt: frame.capturedAt,
        endsAt: frame.capturedAt,
        frames: [frame],
      });
    } else {
      current.frames.push(frame);
      current.lastNumber = position + 1;
      current.endsAt = frame.capturedAt;
    }
    previous = frame;
  });

  return scenes;
};

export const sceneSamplesOf = <TFrame extends SceneFrame>(
  scenes: readonly GalleryScene<TFrame>[],
  count: number,
): TFrame[] => {
  if (scenes.length === 0 || count <= 0) {
    return [];
  }
  const slots = Math.min(count, scenes.length);
  const step = scenes.length / slots;
  const picks = Array.from({ length: slots }, (_, slot) => scenes[Math.floor(slot * step)]);
  return picks.flatMap((scene) => {
    const middle = scene?.frames[Math.floor(scene.frames.length / 2)];
    return middle === undefined ? [] : [middle];
  });
};

export const frameNumberOf = (number: number): string => String(number).padStart(4, '0');

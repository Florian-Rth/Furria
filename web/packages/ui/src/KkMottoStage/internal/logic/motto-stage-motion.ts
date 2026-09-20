import type { KkMottoStageState } from '../motto-stage-state';

export interface KkMottoStageMotion {
  ambient: boolean;
  reveal: boolean;
}

const AT_REST: KkMottoStageMotion = { ambient: false, reveal: false };

const AMBIENT_BY_STATE: Record<KkMottoStageState, boolean> = {
  teaser: true,
  running: true,
  resting: false,
};

export const mottoStageMotionOf = (
  state: KkMottoStageState,
  reducedMotion: boolean,
): KkMottoStageMotion => {
  if (reducedMotion) {
    return AT_REST;
  }

  return { ambient: AMBIENT_BY_STATE[state], reveal: true };
};

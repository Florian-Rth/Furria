export interface SplitFlapPose {
  fall: number;
  land: number;
  reveal: number;
  cover: number;
  presence: number;
  fallen: boolean;
}

export type FlapPoseAt = (clock: number) => SplitFlapPose;

export interface FlapLeafFrame {
  fall: number;
  land: number;
  fallOpacity: number;
  landOpacity: number;
  revealClip: string;
  coverClip: string;
  presence: number;
  fallShade: number;
  landShade: number;
}

const FALL_SHARE = 0.5;
const LAND_SHARE = 0.78;
const REBOUND_DEGREES = 14;
const RIGHT_ANGLE = 90;
const PRESENCE_GAIN = 2.4;
const HALF = 50;
const SPILL = '-40%';
const SHADE_DEPTH = 0.4;
const BAND_REACH = 62;

export const FLAT_PROGRESS = FALL_SHARE + (1 - FALL_SHARE) * LAND_SHARE;

export const TOP_HALF_CLIP = `inset(${SPILL} ${SPILL} ${HALF}% ${SPILL})`;
export const BOTTOM_HALF_CLIP = `inset(${HALF}% ${SPILL} ${SPILL} ${SPILL})`;
const WHOLE_TILE_CLIP = `inset(${SPILL} ${SPILL} ${SPILL} ${SPILL})`;
const UNREVEALED_CLIP = 'inset(0% 0% 100% 0%)';
const COVERED_CLIP = 'inset(100% 0% 0% 0%)';

const landAngleAt = (settling: number): number => {
  if (settling < LAND_SHARE) {
    return RIGHT_ANGLE * (1 - (settling / LAND_SHARE) ** 2);
  }

  return REBOUND_DEGREES * Math.sin((Math.PI * (settling - LAND_SHARE)) / (1 - LAND_SHARE));
};

const cosineOf = (degrees: number): number => Math.cos((degrees * Math.PI) / 180);

export const flapPoseAt = (progress: number): SplitFlapPose => {
  const presence = Math.min(Math.sin(Math.PI * progress) * PRESENCE_GAIN, 1);

  if (progress < FALL_SHARE) {
    const fall = -RIGHT_ANGLE * (progress / FALL_SHARE) ** 2;

    return {
      fall,
      land: RIGHT_ANGLE,
      reveal: 1 - cosineOf(fall),
      cover: 0,
      presence,
      fallen: false,
    };
  }

  const settling = Math.min((progress - FALL_SHARE) / (1 - FALL_SHARE), 1);
  const land = landAngleAt(settling);

  return {
    fall: -RIGHT_ANGLE,
    land,
    reveal: 1,
    cover: settling < LAND_SHARE ? cosineOf(land) : 1,
    presence,
    fallen: true,
  };
};

const revealClipOf = (pose: SplitFlapPose): string =>
  pose.reveal <= 0
    ? UNREVEALED_CLIP
    : `inset(${SPILL} ${SPILL} ${HALF + HALF * (1 - pose.reveal)}% ${SPILL})`;

const coverClipOf = (pose: SplitFlapPose): string =>
  pose.cover >= 1 ? COVERED_CLIP : `inset(${HALF + HALF * pose.cover}% ${SPILL} ${SPILL} ${SPILL})`;

const leafShadeOf = (degrees: number): number => SHADE_DEPTH * (1 - cosineOf(degrees));

export const turnedPoseOf = (
  fall: number,
  land: number,
  cover: number,
  presence: number,
): SplitFlapPose => ({
  fall,
  land,
  reveal: 1 - cosineOf(fall),
  cover,
  presence,
  fallen: fall <= -RIGHT_ANGLE,
});

export const flapLeafOf = (pose: SplitFlapPose): FlapLeafFrame => ({
  fall: pose.fall,
  land: pose.land,
  fallOpacity: pose.fallen ? 0 : 1,
  landOpacity: pose.fallen ? 1 : 0,
  revealClip: revealClipOf(pose),
  coverClip: coverClipOf(pose),
  presence: pose.presence,
  fallShade: leafShadeOf(pose.fall),
  landShade: leafShadeOf(pose.land),
});

export const tileBandClipOf = (presence: number): string => {
  if (presence >= 1) {
    return WHOLE_TILE_CLIP;
  }

  const edge = HALF - BAND_REACH * Math.max(presence, 0);

  return `inset(${edge}% ${SPILL} ${edge}% ${SPILL})`;
};

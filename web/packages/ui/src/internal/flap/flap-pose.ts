export interface SplitFlapPose {
  fall: number;
  land: number;
  reveal: number;
  cover: number;
  presence: number;
  fallen: boolean;
}

const FALL_SHARE = 0.5;
const LAND_SHARE = 0.78;
const REBOUND_DEGREES = 14;
const RIGHT_ANGLE = 90;
const PRESENCE_GAIN = 2.4;
const HALF = 50;
const SPILL = '-40%';
const SHADE_DEPTH = 0.4;

export const TOP_HALF_CLIP = `inset(${SPILL} ${SPILL} ${HALF}% ${SPILL})`;
export const BOTTOM_HALF_CLIP = `inset(${HALF}% ${SPILL} ${SPILL} ${SPILL})`;

export const ramp = (value: number, from: number, to: number): number =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);

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

export const revealClipOf = (pose: SplitFlapPose): string =>
  `inset(${SPILL} ${SPILL} ${HALF + HALF * (1 - pose.reveal)}% ${SPILL})`;

export const coverClipOf = (pose: SplitFlapPose): string =>
  `inset(${HALF + HALF * pose.cover}% ${SPILL} ${SPILL} ${SPILL})`;

export const leafShadeOf = (degrees: number): number => SHADE_DEPTH * (1 - cosineOf(degrees));

import type { KeyframeEasing } from '@/features/act-player/choreography-motion';
import {
  EASING_TEXT,
  facingTextOf,
  moveDeskTitleOf,
  STUDIO_MOVE_BENT,
  STUDIO_MOVE_NONE,
  STUDIO_MOVE_STRAIGHT,
} from '../studio-copy';
import { KEYFRAME_EASINGS } from '../studio-movement';
import type { ActStudioMovement } from './use-act-studio-movement';

const TURN_DEGREES = 45;

export interface MoveDeskEasing {
  key: KeyframeEasing;
  text: string;
  current: boolean;
  press: () => void;
}

export interface MoveDesk {
  title: string;
  moving: boolean;
  bent: boolean;
  curveText: string;
  easings: MoveDeskEasing[];
  facingText: string;
  faced: boolean;
  keyed: boolean;
  straighten: () => void;
  turnLeft: () => void;
  turnRight: () => void;
  unface: () => void;
  unkey: () => void;
}

export const useMoveDesk = (movement: ActStudioMovement): MoveDesk => {
  const { lead } = movement;

  return {
    title: lead === null ? STUDIO_MOVE_NONE : moveDeskTitleOf(lead.fromSeconds, lead.toSeconds),
    moving: lead !== null,
    bent: lead?.bent ?? false,
    curveText: lead?.bent ? STUDIO_MOVE_BENT : STUDIO_MOVE_STRAIGHT,
    easings: KEYFRAME_EASINGS.map((easing) => ({
      key: easing,
      text: EASING_TEXT[easing],
      current: lead?.easing === easing,
      press: () => {
        movement.ease(easing);
      },
    })),
    facingText: facingTextOf(lead?.facingDegrees ?? null),
    faced: lead !== null && lead.facingDegrees !== null,
    keyed: movement.keyed,
    straighten: movement.straighten,
    turnLeft: () => {
      movement.turn(-TURN_DEGREES);
    },
    turnRight: () => {
      movement.turn(TURN_DEGREES);
    },
    unface: movement.unface,
    unkey: movement.unkey,
  };
};

import type { StagePoint } from '@furria/studio/choreography-motion';
import { pulseHaptic } from '@furria/studio/haptics';
import { viewShareOf } from '@furria/studio/practice-stage';
import type { StageGridLine } from '@furria/studio/stage-grid';
import { snapLinesOf, stageGridOf } from '@furria/studio/stage-grid';
import type { StageShare } from '@furria/studio/stage-zoom';
import { QUARTER_GRID_ZOOM } from '@furria/studio/stage-zoom';
import { stagePlaceTextOf } from '@furria/studio/studio-copy';
import { studioDotsAt } from '@furria/studio/studio-dots';
import type { StageGestures, StageGestureTarget } from '@furria/studio/use-stage-gestures';
import { useStageGestures } from '@furria/studio/use-stage-gestures';
import { useRef, useState } from 'react';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StudioScreen } from './use-studio-screen';

export interface StudioStageWork {
  gestures: StageGestures;
  choose: (spotId: number) => void;
  nudge: (spotId: number, right: number, down: number) => void;
  grid: readonly StageGridLine[];
  lifted: ReadonlySet<number>;
  bending: number | null;
}

interface HeldDots {
  kind: 'dots';
  primary: number;
}

interface HeldBend {
  kind: 'bend';
  spotId: number;
}

type Held = HeldDots | HeldBend;

const DOT = 'dot:';
const BEND = 'bend:';
const BEND_PRIORITY = 2;
const NO_LIFT: ReadonlySet<number> = new Set();

const spotOf = (id: string, prefix: string): number | null =>
  id.startsWith(prefix) ? Number(id.slice(prefix.length)) : null;

const onWholeMetre = (metres: number): boolean => Number.isInteger(metres);

export const useStudioStageWork = (
  screen: StudioScreen,
  editor: ActStudioStage,
  onGrab?: () => void,
): StudioStageWork => {
  const { player, stage } = screen.playback;
  const held = useRef<Held | null>(null);
  const lastPoint = useRef<StagePoint | null>(null);
  const [lifted, setLifted] = useState<ReadonlySet<number>>(NO_LIFT);
  const [bending, setBending] = useState<number | null>(null);
  const [snap, setSnap] = useState<StageShare | null>(null);

  const targets = (): StageGestureTarget[] => [
    ...studioDotsAt(editor.scene, player.position(), editor.selected, false).map((dot) => ({
      id: `${DOT}${dot.spotId}`,
      x: dot.x,
      y: dot.y,
      selected: dot.selected,
      priority: 0,
    })),
    ...editor.movement.handles.map((handle) => ({
      id: `${BEND}${handle.spotId}`,
      x: handle.x,
      y: handle.y,
      selected: false,
      priority: BEND_PRIORITY,
    })),
  ];

  const bendFollowed = (point: StagePoint | null): string | null =>
    point === null ? null : stagePlaceTextOf(point.rightMetres, point.backMetres);

  const followed = (point: StagePoint | null): string | null => {
    if (point === null) {
      setSnap(null);
      return null;
    }
    const last = lastPoint.current;
    const crossed =
      (onWholeMetre(point.rightMetres) && point.rightMetres !== last?.rightMetres) ||
      (onWholeMetre(point.backMetres) && point.backMetres !== last?.backMetres);
    if (crossed) {
      pulseHaptic();
    }
    lastPoint.current = point;
    setSnap(viewShareOf(point, stage));
    return stagePlaceTextOf(point.rightMetres, point.backMetres);
  };

  const released = (): void => {
    held.current = null;
    lastPoint.current = null;
    setLifted(NO_LIFT);
    setBending(null);
    setSnap(null);
  };

  const gestures = useStageGestures({
    targets,
    onTap: (id) => {
      const spotId = id === null ? null : spotOf(id, DOT);
      if (id !== null && spotId === null) {
        return;
      }
      if (spotId !== null) {
        onGrab?.();
      }
      editor.tap(spotId);
    },
    onHold: (id) => {
      const spotId = id === null ? null : spotOf(id, DOT);
      if (spotId !== null) {
        onGrab?.();
        editor.hold(spotId);
      }
    },
    onDragStart: (id, share) => {
      const bent = spotOf(id, BEND);
      if (bent !== null) {
        if (!editor.movement.bendPress(bent)) {
          return false;
        }
        held.current = { kind: 'bend', spotId: bent };
        setBending(bent);
        return true;
      }
      const spotId = spotOf(id, DOT);
      if (spotId === null) {
        return false;
      }
      onGrab?.();
      const chosen = editor.grab(spotId, share);
      if (chosen === null) {
        return false;
      }
      held.current = { kind: 'dots', primary: spotId };
      setLifted(new Set(chosen));
      return true;
    },
    onDrag: (share) => {
      const current = held.current;
      if (current === null) {
        return null;
      }
      if (current.kind === 'bend') {
        return bendFollowed(editor.movement.bendMove(share));
      }
      return followed(editor.move(share).get(current.primary) ?? null);
    },
    onDragEnd: () => {
      if (held.current?.kind === 'bend') {
        editor.movement.bendEnd();
      } else {
        editor.end();
      }
      released();
    },
    onDragCancel: () => {
      editor.cancel();
      released();
    },
  });

  return {
    gestures,
    choose: (spotId) => {
      onGrab?.();
      editor.tap(spotId);
    },
    nudge: (spotId, right, down) => {
      onGrab?.();
      editor.nudge(spotId, right, down);
    },
    grid: [...stageGridOf(stage, gestures.zoom >= QUARTER_GRID_ZOOM), ...snapLinesOf(snap)],
    lifted,
    bending,
  };
};

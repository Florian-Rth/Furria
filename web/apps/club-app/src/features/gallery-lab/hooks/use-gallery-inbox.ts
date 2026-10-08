import type {
  KkLightTableDeparture,
  KkLightTableDone,
  KkLightTableFrame,
  KkLightTableStripFrame,
  KkLightTableTarget,
} from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { GALLERY_PATH, INBOX_TITLE } from '../gallery-copy';
import { scenesOf } from '../gallery-scenes';
import { countLabel, sceneSpanLabel } from '../gallery-view';
import type { LabItem } from '../lab-gallery-data';
import { LAB_INBOX_ALBUM, labItemsOf, labSourceOf } from '../lab-gallery-data';
import type { CullFrame, CullIntent, CullState } from '../light-table';
import { cull, openCount, startCulling, verdictCount, verdictOf } from '../light-table';

const TARGETS = [
  { id: 'herbstfest', title: 'Herbstfest 2026', base: 0 },
  { id: 'garde', title: 'Garde · Trainingslager', base: 214 },
  { id: 'vereinsheim', title: 'Vereinsheim-Renovierung', base: 64 },
] as const;
const HURRY_MS = 260;
const STRIP_REACH = 14;

export interface GalleryInbox {
  title: string;
  remaining: string;
  tally: string;
  scene: string;
  position: string;
  frame: KkLightTableFrame | null;
  departure: KkLightTableDeparture | null;
  strip: KkLightTableStripFrame[];
  targets: KkLightTableTarget[];
  confirmQuestion: string | null;
  hurried: boolean;
  done: KkLightTableDone | null;
  onStep: (delta: number) => void;
  onReject: (wholeScene: boolean) => void;
  onFile: (slot: number, wholeScene: boolean) => void;
  onUndo: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  onStripSelect: (id: string) => void;
}

interface InboxDesk {
  items: LabItem[];
  frames: CullFrame[];
  sceneLabels: string[];
}

const buildDesk = (): InboxDesk => {
  const items = labItemsOf(LAB_INBOX_ALBUM).filter((item) => item.kind === 'photo');
  const scenes = scenesOf(items);
  const frames = scenes.flatMap((scene, index) =>
    scene.frames.map((item) => ({ id: item.id, scene: index })),
  );
  return { items, frames, sceneLabels: scenes.map((scene) => sceneSpanLabel(scene)) };
};

const preCulled = (frames: readonly CullFrame[], left: number | undefined): CullState => {
  const fresh = startCulling(frames);
  if (left === undefined) {
    return fresh;
  }
  const settled = frames.slice(0, Math.max(frames.length - left, 0));
  const verdicts: CullState['verdicts'] = {};
  settled.forEach((frame, index) => {
    verdicts[frame.id] =
      index % 3 === 0 ? { kind: 'rejected' } : { kind: 'filed', slot: index % 2 };
  });
  return { ...fresh, verdicts, cursor: settled.length };
};

export const useGalleryInbox = (left: number | undefined): GalleryInbox => {
  const navigate = useNavigate();
  const [desk] = useState(buildDesk);
  const [state, setState] = useState(() => preCulled(desk.frames, left));
  const [lastAt, setLastAt] = useState(0);
  const [hurried, setHurried] = useState(false);

  const dispatch = (intent: CullIntent): void => {
    const now = performance.now();
    setHurried(now - lastAt < HURRY_MS);
    setLastAt(now);
    setState((current) => cull(current, intent));
  };

  const itemOf = (id: number): LabItem | undefined => desk.items.find((item) => item.id === id);
  const currentFrame = state.frames[state.cursor];
  const currentItem = currentFrame === undefined ? undefined : itemOf(currentFrame.id);
  const remaining = openCount(state);
  const rejected = verdictCount(state, 'rejected');
  const filed = verdictCount(state, 'filed');
  const sceneIndex = currentFrame?.scene ?? 0;
  const sceneFrames = state.frames.filter((frame) => frame.scene === sceneIndex);
  const inScene = sceneFrames.findIndex((frame) => frame.id === currentFrame?.id) + 1;
  const done = remaining === 0;

  const departedItem = state.departure === null ? undefined : itemOf(state.departure.id);
  const departure: KkLightTableDeparture | null =
    state.departure === null || departedItem === undefined
      ? null
      : {
          key: state.departure.key,
          source: labSourceOf(departedItem.photo),
          kind: state.departure.verdict.kind === 'rejected' ? 'reject' : 'file',
          slot: state.departure.verdict.kind === 'filed' ? state.departure.verdict.slot : 0,
          stamp:
            state.departure.verdict.kind === 'filed'
              ? (TARGETS[state.departure.verdict.slot]?.title.split(' ')[0] ?? '')
              : '',
        };

  const strip: KkLightTableStripFrame[] = sceneFrames
    .filter((_frame, index) => Math.abs(index + 1 - inScene) <= STRIP_REACH)
    .flatMap((frame) => {
      const item = itemOf(frame.id);
      if (item === undefined) {
        return [];
      }
      const verdict = verdictOf(state, frame.id);
      return [
        {
          id: String(frame.id),
          label: `Bild ${item.number}`,
          source: labSourceOf(item.photo),
          verdict: verdict.kind,
          slot: verdict.kind === 'filed' ? verdict.slot + 1 : null,
          current: frame.id === currentFrame?.id,
        },
      ];
    });

  const targets: KkLightTableTarget[] = TARGETS.map((target, slot) => ({
    id: target.id,
    title: target.title,
    count: countLabel(target.base + verdictCount(state, 'filed', slot)),
  }));

  const pendingCount =
    state.pending === null
      ? 0
      : state.frames.filter(
          (frame) =>
            frame.scene === state.pending?.scene && verdictOf(state, frame.id).kind === 'open',
        ).length;
  const confirmQuestion =
    state.pending === null
      ? null
      : state.pending.verdict.kind === 'rejected'
        ? `${pendingCount} Bilder dieser Szene endgültig verwerfen?`
        : `${pendingCount} Bilder nach „${TARGETS[state.pending.verdict.slot]?.title ?? ''}"?`;

  return {
    title: INBOX_TITLE,
    remaining: countLabel(remaining),
    tally: `übrig · ${countLabel(rejected)} verworfen · ${countLabel(filed)} abgelegt`,
    scene: `Szene ${sceneIndex + 1} · ${desk.sceneLabels[sceneIndex] ?? ''}`,
    position: `${inScene} / ${sceneFrames.length}`,
    frame:
      done || currentItem === undefined
        ? null
        : {
            id: String(currentItem.id),
            label: `Bild ${currentItem.number}`,
            source: labSourceOf(currentItem.photo),
          },
    departure,
    strip,
    targets,
    confirmQuestion,
    hurried,
    done: done
      ? {
          headline: 'EINGANG LEER',
          summary: `${countLabel(filed)} abgelegt · ${countLabel(rejected)} verworfen`,
        }
      : null,
    onStep: (delta) => dispatch({ kind: 'step', delta }),
    onReject: (wholeScene) => dispatch({ kind: 'reject', wholeScene }),
    onFile: (slot, wholeScene) => dispatch({ kind: 'file', slot, wholeScene }),
    onUndo: () => dispatch({ kind: 'undo' }),
    onConfirm: () => dispatch({ kind: 'confirm' }),
    onCancel: () => dispatch({ kind: 'cancel' }),
    onClose: () => {
      void navigate({ to: GALLERY_PATH });
    },
    onStripSelect: (id) => dispatch({ kind: 'jump', id: Number(id) }),
  };
};

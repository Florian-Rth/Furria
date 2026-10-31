import type { KkLaneButtonTone } from '@furria/ui/KkLaneButton';
import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import type { KkLaneInspectorFact } from '@furria/ui/KkLaneInspector';
import { useState } from 'react';
import { poseAt } from '@/features/act-player/choreography-motion';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { useStepTexts } from '@/features/act-studio/hooks/use-step-texts';
import { videoNameOf } from '@/features/act-studio/studio-copy';
import { markSecondsOf, partSettingsOf, startsAPart } from '@/features/act-studio/studio-steps';
import {
  clockOf,
  countLengthOf,
  countPlaceTextOf,
  DESK_ALIGN,
  DESK_ALIGN_DEEP,
  DESK_ALL_SPOTS,
  DESK_BLOCK,
  DESK_CIRCLE,
  DESK_COPY,
  DESK_DELETE,
  DESK_DESCRIPTION,
  DESK_DESCRIPTION_PLACEHOLDER,
  DESK_DISSOLVE,
  DESK_DISTRIBUTE,
  DESK_EARLIER,
  DESK_LATER,
  DESK_LINE,
  DESK_LONGER,
  DESK_LONGER_LABEL,
  DESK_LOOP,
  DESK_MARK_HERE,
  DESK_MARK_HERE_LABEL,
  DESK_MIRROR,
  DESK_NAME,
  DESK_NEW_PART,
  DESK_NO_MUSIC,
  DESK_NO_STEP,
  DESK_OPEN,
  DESK_PICK_HINT,
  DESK_SHORTER,
  DESK_SHORTER_LABEL,
  DESK_START_HERE,
  DESK_STRAIGHT,
  DESK_TURN_LEFT,
  DESK_TURN_RIGHT,
  DESK_UNKEY,
  FACT_END,
  FACT_FACING,
  FACT_KEYS,
  FACT_LENGTH,
  FACT_PART,
  FACT_PERSON,
  FACT_SPOTS,
  FACT_START,
  FACT_STATE,
  FACT_STEPS,
  FACT_WHERE,
  facingTextOf,
  keyEyebrowOf,
  newPartNameOf,
  partEyebrowOf,
  partStepsOf,
  pointTextOf,
  spotEyebrowOf,
  spotsAmountOf,
  spotTitleOf,
  stepEyebrowOf,
  videoEyebrowOf,
} from '../desk-copy';
import { keyedSpotsAt } from '../desk-keyframes';
import { countPlaceAt, countsBetweenOf } from '../desk-time';
import type { ActDesk } from './use-act-desk';
import type { DeskBorders } from './use-desk-borders';

const TURN_DEGREES = 45;

export interface DeskInspectorAction {
  key: string;
  text: string;
  glyph: KkLaneGlyphName;
  tone: KkLaneButtonTone;
  label: string | undefined;
  disabled: boolean;
  press: () => void;
}

export interface DeskInspectorField {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  change: (value: string) => void;
  commit: () => void;
}

export interface DeskInspectorView {
  eyebrow: string;
  title: string;
  facts: KkLaneInspectorFact[];
  fields: DeskInspectorField[];
  actions: DeskInspectorAction[];
  arrange: DeskInspectorAction[];
  note: string | null;
}

const actionOf = (
  key: string,
  text: string,
  glyph: KkLaneGlyphName,
  press: () => void,
  options: { tone?: KkLaneButtonTone; label?: string; disabled?: boolean } = {},
): DeskInspectorAction => ({
  key,
  text,
  glyph,
  press,
  tone: options.tone ?? 'quiet',
  label: options.label,
  disabled: options.disabled ?? false,
});

const factOf = (key: string, term: string, value: string): KkLaneInspectorFact => ({
  key,
  term,
  value,
});

export const useArrangeActions = (desk: ActDesk): DeskInspectorAction[] => {
  const { editor } = desk;
  const preset =
    (kind: 'line' | 'circle' | 'block'): (() => void) =>
    () => {
      editor.preset(kind);
    };

  return [
    actionOf('line', DESK_LINE, 'line', preset('line')),
    actionOf('circle', DESK_CIRCLE, 'circle', preset('circle')),
    actionOf('block', DESK_BLOCK, 'block', preset('block')),
    actionOf('mirror', DESK_MIRROR, 'mirror', editor.mirror, { disabled: !editor.canMirror }),
    actionOf(
      'align',
      DESK_ALIGN,
      'alignAcross',
      () => {
        editor.align('across');
      },
      { disabled: !editor.canAlign },
    ),
    actionOf(
      'alignDeep',
      DESK_ALIGN_DEEP,
      'alignDeep',
      () => {
        editor.align('deep');
      },
      { disabled: !editor.canAlign },
    ),
    actionOf(
      'distribute',
      DESK_DISTRIBUTE,
      'distribute',
      () => {
        editor.distribute('across');
      },
      { disabled: !editor.canDistribute },
    ),
    actionOf('copy', DESK_COPY, 'copy', editor.copy, {
      disabled: editor.previousSeconds === null,
    }),
  ];
};

const useDeskInspectorView = (desk: ActDesk, borders: DeskBorders): DeskInspectorView => {
  const { screen, editor, takes, focus, partId, keySeconds } = desk;
  const { playback, practice, studio, manual, videos } = screen;
  const { steps, parts, countMarks, length, player, paths } = playback;
  const texts = useStepTexts(screen);
  const [partDraft, setPartDraft] = useState<{ partId: number; name: string } | null>(null);
  const arrange = useArrangeActions(desk);
  const step = practice.step;
  const stepIndex = steps.findIndex((candidate) => candidate.stepId === step?.stepId);
  const numberOf = (stepId: number): number =>
    steps.findIndex((candidate) => candidate.stepId === stepId) + 1;
  const markHere = actionOf(
    'mark',
    DESK_MARK_HERE,
    'add',
    () => {
      manual.mark.mutate(markSecondsOf(playback, player.position()));
    },
    {
      label: DESK_MARK_HERE_LABEL,
      disabled: length <= 0,
      tone: steps.length === 0 ? 'accent' : 'quiet',
    },
  );

  if (focus === 'part') {
    const part = parts.find((candidate) => candidate.partId === partId) ?? null;
    if (part !== null) {
      const range = partRangeOf(part, steps);
      const first = numberOf(part.stepIds[0] ?? -1);
      const last = numberOf(part.stepIds.at(-1) ?? -1);
      const name = partDraft?.partId === part.partId ? partDraft.name : part.name;
      const counts = range === null ? 0 : countsBetweenOf(countMarks, range.start, range.end);

      return {
        eyebrow: partEyebrowOf(first, last),
        title: part.name,
        facts: [
          factOf('steps', FACT_STEPS, partStepsOf(first, last, part.stepIds.length)),
          factOf('start', FACT_START, clockOf(range?.start ?? 0)),
          factOf('end', FACT_END, clockOf(range?.end ?? 0)),
          factOf('length', FACT_LENGTH, countLengthOf(counts)),
        ],
        fields: [
          {
            key: 'part',
            label: FACT_PART,
            value: name,
            placeholder: part.name,
            change: (value) => {
              setPartDraft({ partId: part.partId, name: value });
            },
            commit: () => {
              const draft = partDraft?.name.trim() ?? '';
              setPartDraft(null);
              if (draft !== '' && draft !== part.name) {
                manual.settlePart.mutate({
                  partId: part.partId,
                  settings: { ...partSettingsOf(part), name: draft },
                });
              }
            },
          },
        ],
        actions: [
          actionOf('loop', DESK_LOOP, 'parts', () => {
            practice.loopPart(part.stepIds[0] ?? -1);
          }),
          actionOf(
            'dissolve',
            DESK_DISSOLVE,
            'dissolve',
            () => {
              manual.removePart.mutate(part.partId);
              desk.focusStep(null);
            },
            { tone: 'danger' },
          ),
        ],
        arrange: [],
        note: null,
      };
    }
  }

  if (focus === 'video' && takes.selected !== null) {
    const video = takes.selected;
    const number = studio.videos.indexOf(video) + 1;
    const placed = video.startSeconds !== null;

    return {
      eyebrow: videoEyebrowOf(number),
      title: videoNameOf(video.name, number),
      facts: [
        factOf('start', FACT_START, placed ? clockOf(video.startSeconds ?? 0) : DESK_OPEN),
        factOf('length', FACT_LENGTH, clockOf(video.durationSeconds ?? 0)),
        factOf('state', FACT_STATE, takes.text),
      ],
      fields: [],
      actions: [
        actionOf(
          'earlier',
          DESK_EARLIER,
          'left',
          () => {
            takes.nudge('earlier');
          },
          { disabled: !takes.canNudge },
        ),
        actionOf(
          'later',
          DESK_LATER,
          'right',
          () => {
            takes.nudge('later');
          },
          { disabled: !takes.canNudge },
        ),
        actionOf('here', DESK_START_HERE, 'video', () => {
          videos.place.mutate({ videoId: video.videoId, startSeconds: player.position() });
        }),
        actionOf(
          'delete',
          DESK_DELETE,
          'delete',
          () => {
            videos.remove.mutate(video.videoId);
            desk.focusStep(null);
          },
          { tone: 'danger' },
        ),
      ],
      arrange: [],
      note: null,
    };
  }

  if (focus === 'key' && keySeconds !== null) {
    const place = countPlaceAt(countMarks, keySeconds);

    return {
      eyebrow: keyEyebrowOf(keySeconds),
      title: place === null ? clockOf(keySeconds) : countPlaceTextOf(place.eight, place.count),
      facts: [
        factOf('time', FACT_START, clockOf(keySeconds)),
        factOf('spots', FACT_SPOTS, spotsAmountOf(keyedSpotsAt(paths, keySeconds))),
      ],
      fields: [],
      actions: [
        actionOf('unkey', DESK_UNKEY, 'delete', editor.movement.unkey, {
          tone: 'danger',
          disabled: editor.selected.length === 0 || !editor.movement.keyed,
        }),
      ],
      arrange,
      note: editor.selected.length === 0 ? DESK_PICK_HINT : null,
    };
  }

  if (focus === 'spot') {
    const chosen = studio.spots.filter((spot) => editor.selected.includes(spot.spotId));
    const single = chosen.length === 1 ? (chosen[0] ?? null) : null;
    const path =
      single === null ? null : paths.find((candidate) => candidate.spotId === single.spotId);
    const pose = path === null || path === undefined ? null : poseAt(path, player.position());
    const keys = path?.keyframes.length ?? 0;
    const turn =
      (delta: number): (() => void) =>
      () => {
        editor.movement.turn(delta);
      };
    const moving = editor.moving;

    return {
      eyebrow: spotEyebrowOf(chosen.length),
      title:
        single === null
          ? chosen.map((spot) => spot.number).join(', ')
          : spotTitleOf(single.number, single.person?.firstName ?? null),
      facts:
        single === null
          ? [factOf('spots', FACT_SPOTS, spotsAmountOf(chosen.length))]
          : [
              factOf(
                'person',
                FACT_PERSON,
                single.person === null
                  ? DESK_OPEN
                  : `${single.person.firstName} ${single.person.lastName}`,
              ),
              factOf(
                'where',
                FACT_WHERE,
                pose === null
                  ? DESK_OPEN
                  : pointTextOf(pose.position.rightMetres, pose.position.backMetres),
              ),
              factOf('facing', FACT_FACING, facingTextOf(pose?.facingDegrees ?? null)),
              factOf('keys', FACT_KEYS, String(keys)),
            ],
      fields: [],
      actions: moving
        ? [
            actionOf('straight', DESK_STRAIGHT, 'line', editor.movement.straighten, {
              disabled: editor.movement.lead === null,
            }),
            actionOf('left', DESK_TURN_LEFT, 'left', turn(-TURN_DEGREES)),
            actionOf('right', DESK_TURN_RIGHT, 'right', turn(TURN_DEGREES)),
          ]
        : [],
      arrange: moving ? [] : arrange,
      note: null,
    };
  }

  if (step === null) {
    return {
      eyebrow: stepEyebrowOf(0, steps.length, null),
      title: DESK_ALL_SPOTS,
      facts: [],
      fields: [],
      actions: [markHere],
      arrange: [],
      note: length <= 0 ? DESK_NO_MUSIC : DESK_NO_STEP,
    };
  }

  const part = parts.find((candidate) => candidate.stepIds.includes(step.stepId)) ?? null;
  const counts = countsBetweenOf(countMarks, step.startSeconds ?? 0, step.endSeconds ?? 0);
  const startPlace = countPlaceAt(countMarks, step.startSeconds ?? 0);
  const canStretch = borders.canStretch(step.stepId);

  return {
    eyebrow: stepEyebrowOf(stepIndex + 1, steps.length, part?.name ?? null),
    title: step.name,
    facts: [
      factOf(
        'start',
        FACT_START,
        startPlace === null
          ? clockOf(step.startSeconds ?? 0)
          : `${clockOf(step.startSeconds ?? 0)} · ${countPlaceTextOf(startPlace.eight, startPlace.count)}`,
      ),
      factOf('end', FACT_END, clockOf(step.endSeconds ?? 0)),
      factOf('length', FACT_LENGTH, countLengthOf(counts)),
      factOf('part', FACT_PART, part?.name ?? DESK_OPEN),
    ],
    fields: [
      {
        key: 'name',
        label: DESK_NAME,
        value: texts.name,
        placeholder: step.name,
        change: texts.rename,
        commit: texts.commit,
      },
      {
        key: 'description',
        label: DESK_DESCRIPTION,
        value: texts.description,
        placeholder: DESK_DESCRIPTION_PLACEHOLDER,
        change: texts.describe,
        commit: texts.commit,
      },
    ],
    actions: [
      actionOf(
        'shorter',
        DESK_SHORTER,
        'remove',
        () => {
          borders.stretch(step.stepId, -1);
        },
        { label: DESK_SHORTER_LABEL, disabled: !canStretch },
      ),
      actionOf(
        'longer',
        DESK_LONGER,
        'add',
        () => {
          borders.stretch(step.stepId, 1);
        },
        { label: DESK_LONGER_LABEL, disabled: !canStretch },
      ),
      markHere,
      actionOf(
        'part',
        DESK_NEW_PART,
        'parts',
        () => {
          manual.addPart.mutate({
            firstStepId: step.stepId,
            name: newPartNameOf(parts.length + 1),
          });
        },
        { disabled: startsAPart(parts, step.stepId) },
      ),
      actionOf('loop', DESK_LOOP, 'steps', () => {
        practice.loopStep(step.stepId);
      }),
      actionOf(
        'delete',
        DESK_DELETE,
        'delete',
        () => {
          manual.remove.mutate(step.stepId);
        },
        { tone: 'danger' },
      ),
    ],
    arrange: desk.stageTool === 'formation' ? arrange : [],
    note: null,
  };
};

const EVENING_ACTIONS: readonly string[] = ['loop', 'straight', 'left', 'right', 'unkey'];

export const useDeskInspector = (desk: ActDesk, borders: DeskBorders): DeskInspectorView => {
  const view = useDeskInspectorView(desk, borders);

  return desk.screen.evening === null
    ? view
    : {
        ...view,
        fields: [],
        actions: view.actions.filter((action) => EVENING_ACTIONS.includes(action.key)),
      };
};

import type { KkFocusOutlineRename } from '@furria/ui/KkFocusOutline';
import { useState } from 'react';
import { shownStepNameOf } from '@/features/act-player/step-names';
import { useStepTexts } from '@/features/act-studio/hooks/use-step-texts';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { newPartNameOf } from '@/features/act-studio/studio-copy';
import { markSecondsOf, partSettingsOf, startsAPart } from '@/features/act-studio/studio-steps';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import {
  FOCUS_NO_PART,
  FOCUS_PART_NAME,
  FOCUS_STEP_NAME,
  FOCUS_UNNAMED,
  partMetaOf,
  stepLabelOf,
  stepMetaOf,
} from '../focus-copy';
import { countCellsOf } from '../focus-counts';
import { stepsEditableOf } from '../focus-lock';

const COUNTS_PER_EIGHT = 8;

export interface FocusOutlineStep {
  key: string;
  number: number;
  name: string;
  meta: string;
  label: string;
  current: boolean;
  rename: KkFocusOutlineRename | null;
  press: () => void;
}

export interface FocusOutlineGroup {
  key: string;
  name: string;
  meta: string;
  rename: KkFocusOutlineRename | null;
  steps: FocusOutlineStep[];
}

export interface FocusOutline {
  groups: FocusOutlineGroup[];
  canMark: boolean;
  canOpenPart: boolean;
  canRemove: boolean;
  removing: boolean;
  markHere: () => void;
  openPart: () => void;
  remove: () => void;
}

interface Draft {
  partId: number;
  name: string;
}

export const useFocusOutline = (screen: StudioScreen, reveal: () => void): FocusOutline => {
  const { playback, practice, manual } = screen;
  const { steps, parts, countMarks, player, length } = playback;
  const texts = useStepTexts(screen);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const current = practice.step;
  const editable = stepsEditableOf({
    evening: screen.evening !== null,
    editing: screen.mode.editing,
  });
  if (removingId !== null && removingId !== current?.stepId) {
    setRemovingId(null);
  }
  const currentPart =
    current === null ? null : (parts.find((part) => part.stepIds.includes(current.stepId)) ?? null);

  const rowOf = (step: StudioStep): FocusOutlineStep => {
    const number = steps.indexOf(step) + 1;
    const isCurrent = step.stepId === current?.stepId;
    const eights = Math.ceil(
      countCellsOf(countMarks, {
        start: step.startSeconds ?? 0,
        end: step.endSeconds ?? 0,
      }).length / COUNTS_PER_EIGHT,
    );

    return {
      key: String(step.stepId),
      number,
      name: shownStepNameOf(step.name, number),
      meta: stepMetaOf(step.startSeconds, step.endSeconds, eights),
      label: stepLabelOf(number, step.name),
      current: isCurrent,
      rename:
        isCurrent && editable
          ? {
              value: texts.name,
              label: FOCUS_STEP_NAME,
              placeholder: FOCUS_UNNAMED,
              onChange: texts.rename,
              onCommit: texts.commit,
            }
          : null,
      press: () => {
        practice.jumpTo(step.stepId);
        reveal();
      },
    };
  };

  const partRenameOf = (part: StudioPart): KkFocusOutlineRename | null =>
    !editable || part.partId !== currentPart?.partId
      ? null
      : {
          value: draft?.partId === part.partId ? draft.name : part.name,
          label: FOCUS_PART_NAME,
          placeholder: FOCUS_UNNAMED,
          onChange: (name) => {
            setDraft({ partId: part.partId, name });
          },
          onCommit: () => {
            const name = draft?.partId === part.partId ? draft.name.trim() : '';
            setDraft(null);
            if (name !== '' && name !== part.name) {
              manual.settlePart.mutate({
                partId: part.partId,
                settings: { ...partSettingsOf(part), name },
              });
            }
          },
        };

  const grouped = parts.map((part) => {
    const members = steps.filter((step) => part.stepIds.includes(step.stepId));
    return {
      key: String(part.partId),
      name: part.name,
      meta: partMetaOf(members[0]?.startSeconds ?? null, members.length),
      rename: partRenameOf(part),
      steps: members.map(rowOf),
    };
  });
  const loose = steps.filter((step) => !parts.some((part) => part.stepIds.includes(step.stepId)));
  const groups =
    loose.length === 0
      ? grouped
      : [
          {
            key: 'loose',
            name: FOCUS_NO_PART,
            meta: partMetaOf(loose[0]?.startSeconds ?? null, loose.length),
            rename: null,
            steps: loose.map(rowOf),
          },
          ...grouped,
        ];

  return {
    groups,
    canMark: editable && length > 0,
    canOpenPart: editable && current !== null && !startsAPart(parts, current.stepId),
    canRemove: editable && current !== null,
    removing: removingId !== null,
    markHere: () => {
      if (!editable) {
        return;
      }
      manual.mark.mutate(markSecondsOf(playback, player.position()));
    },
    openPart: () => {
      if (editable && current !== null) {
        manual.addPart.mutate({
          firstStepId: current.stepId,
          name: newPartNameOf(parts.length + 1),
        });
      }
    },
    remove: () => {
      if (!editable || current === null) {
        return;
      }
      if (removingId !== current.stepId) {
        setRemovingId(current.stepId);
        return;
      }
      setRemovingId(null);
      manual.remove.mutate(current.stepId);
    },
  };
};

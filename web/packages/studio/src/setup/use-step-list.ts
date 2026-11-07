import type { JobAction } from '@furria/studio/job-view';
import { jobActionOf } from '@furria/studio/job-view';
import { setupProgressOf, setupResumeOf, timedStepsOf } from '@furria/studio/setup-progress';
import type { StepGroup } from '@furria/studio/step-list';
import {
  SETUP_OPEN_TEXT,
  SETUP_RESUME,
  SETUP_START_SETUP,
  STEP_LIST_ADD,
  STEP_LIST_ADD_LABEL,
} from '@furria/studio/step-setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { markSecondsOf } from '@furria/studio/studio-steps';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import { usePartMoves } from '@furria/studio/use-part-moves';
import type { StepListDetail, StepListPartDetail } from '@furria/studio/use-step-list-detail';
import { useStepListDetail } from '@furria/studio/use-step-list-detail';
import type { StepListPart, StepListRow } from '@furria/studio/use-step-list-rows';
import { useStepListRows } from '@furria/studio/use-step-list-rows';
import { useState } from 'react';

export interface StepListSetup {
  text: string;
  action: JobAction;
}

export interface StepList {
  groups: StepGroup<StepListRow>[];
  parts: ReadonlyMap<number, StepListPart>;
  detail: StepListDetail | null;
  partDetail: StepListPartDetail | null;
  add: JobAction;
  setup: StepListSetup;
  editable: boolean;
}

export const useStepList = (screen: StudioScreen, confirm: JobConfirm): StepList => {
  const { playback, studio, evening } = screen;
  const work = screen.document;
  const { steps, player, length } = playback;
  const moves = usePartMoves(screen);
  const [partId, setPartId] = useState<number | null>(null);
  const timed = timedStepsOf(steps);
  const editable = evening === null;
  const rows = useStepListRows(screen, timed, moves, partId, setPartId, confirm);
  const details = useStepListDetail(screen, timed, moves, partId, setPartId, confirm, editable);
  const resume = setupResumeOf(
    setupProgressOf(timed),
    studio.videos.some((video) => video.placement === 'onTimeline'),
  );

  return {
    groups: rows.groups,
    parts: rows.parts,
    detail: details.detail,
    partDetail: details.partDetail,
    add: jobActionOf(
      'add',
      STEP_LIST_ADD,
      'add',
      () => {
        work.mark(markSecondsOf(playback, player.position()), length);
      },
      { label: STEP_LIST_ADD_LABEL, disabled: length <= 0 || !editable },
    ),
    setup: {
      text: SETUP_OPEN_TEXT[resume.open](resume.count, resume.total),
      action: jobActionOf(
        'setup',
        resume.open === 'nothing' ? SETUP_START_SETUP : SETUP_RESUME,
        'steps',
        screen.openStepSetup,
        { tone: resume.open === 'nothing' ? 'quiet' : 'accent' },
      ),
    },
    editable,
  };
};

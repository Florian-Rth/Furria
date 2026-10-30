import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { STUDIO_I_DONE, STUDIO_I_EDIT } from '../studio-i-copy';
import type { StudioIPage } from '../studio-i-model';
import { pageOfStep } from '../studio-i-model';
import { loopOnSpan } from '../studio-i-playhead';
import type { StepSpan } from '../studio-i-spans';
import { spanAt } from '../studio-i-spans';

export interface StudioIModeState {
  editing: boolean;
  page: StudioIPage;
  actions: readonly [KkQuietScreenAction] | undefined;
  enter: () => void;
  setPage: (page: StudioIPage) => void;
}

export const useStudioIMode = (
  playback: StudioPlayback,
  spans: readonly StepSpan[],
  canEdit: boolean,
): StudioIModeState => {
  const { player, countMarks } = playback;
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState<StudioIPage>(pageOfStep(spans[0]?.stepId ?? null));

  const enter = (): void => {
    const span = spanAt(spans, player.position());
    setPage(pageOfStep(span?.stepId ?? null));
    if (span !== null) {
      loopOnSpan(player, span, countMarks);
    }
    setEditing(true);
  };

  const finish = (): void => {
    const span = page.kind === 'step' ? spans.find((known) => known.stepId === page.stepId) : null;
    player.setLoop(null);
    if (span !== undefined && span !== null) {
      player.seek(span.start);
    }
    setEditing(false);
  };

  const editAction: KkQuietScreenAction = {
    id: 'edit',
    label: STUDIO_I_EDIT,
    icon: 'edit',
    onSelect: enter,
  };
  const doneAction: KkQuietScreenAction = {
    id: 'done',
    label: STUDIO_I_DONE,
    icon: 'check',
    onSelect: finish,
  };
  const practiceActions: readonly [KkQuietScreenAction] | undefined = canEdit
    ? [editAction]
    : undefined;

  return {
    editing,
    page,
    actions: editing ? [doneAction] : practiceActions,
    enter,
    setPage,
  };
};

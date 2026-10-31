import type { KkStatusTone } from '@furria/ui/KkStatusLine';
import { KkStatusLine } from '@furria/ui/KkStatusLine';
import type { FC } from 'react';
import type { SaveState } from '../hooks/use-planner-draft';
import { usePlanner } from '../planner-context';
import { toStatusText } from '../planner-copy';

const SAVE_TONES: Record<SaveState, KkStatusTone | null> = {
  empty: null,
  saved: null,
  saving: null,
  failed: 'conflict',
  conflict: 'conflict',
};

export const PlannerStatus: FC = () => {
  const { saveState, confirmedAt, changedSinceConfirmed } = usePlanner().store;
  const confirmed = confirmedAt !== null && saveState === 'saved';
  const confirmedTone = changedSinceConfirmed ? 'attention' : 'done';
  const tone = confirmed ? confirmedTone : SAVE_TONES[saveState];

  if (tone === null) {
    return null;
  }

  return (
    <KkStatusLine tone={tone} text={toStatusText(confirmed, changedSinceConfirmed, saveState)} />
  );
};

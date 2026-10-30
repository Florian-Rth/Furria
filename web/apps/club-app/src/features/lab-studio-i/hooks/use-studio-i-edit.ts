import { useKkStudioILayout } from '@furria/ui/use-kk-studio-i-wide';
import { useState } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioIPage, StudioISelection } from '../studio-i-model';
import { MUSIC_PAGE } from '../studio-i-model';
import { restartOnSpan } from '../studio-i-playhead';
import type { PageDirection, StepSpan } from '../studio-i-spans';
import { neighbourIdOf } from '../studio-i-spans';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIModeState } from './use-studio-i-mode';

export interface StudioIEdit {
  page: StudioIPage;
  span: StepSpan | null;
  index: number;
  selection: StudioISelection | null;
  swapped: boolean;
  wide: boolean;
  sheeted: boolean;
  openPage: (page: StudioIPage) => void;
  go: (direction: PageDirection) => void;
  select: (selection: StudioISelection) => void;
  clearSelection: () => void;
  toggleSwap: () => void;
}

const spanOfPage = (spans: readonly StepSpan[], page: StudioIPage): StepSpan | null =>
  page.kind === 'step' ? (spans.find((span) => span.stepId === page.stepId) ?? null) : null;

export const useStudioIEdit = (
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  mode: StudioIModeState,
): StudioIEdit => {
  const { player, countMarks } = playback;
  const layout = useKkStudioILayout();
  const wide = layout !== 'narrow';
  const [selection, setSelection] = useState<StudioISelection | null>(null);
  const [swapped, setSwapped] = useState(false);
  const span = spanOfPage(drafts.spans, mode.page);

  const openPage = (page: StudioIPage): void => {
    const target = spanOfPage(drafts.spans, page);
    mode.setPage(page);
    setSelection(null);
    if (target === null) {
      player.setLoop(null);
    } else {
      restartOnSpan(player, target, countMarks);
    }
  };

  const go = (direction: PageDirection): void => {
    if (span === null) {
      const first = drafts.spans[0];
      if (direction === 'forward' && first !== undefined) {
        openPage({ kind: 'step', stepId: first.stepId });
      }
      return;
    }
    const next = neighbourIdOf(drafts.spans, span.stepId, direction);
    if (next !== null) {
      openPage({ kind: 'step', stepId: next });
    } else if (direction === 'back') {
      openPage(MUSIC_PAGE);
    }
  };

  return {
    page: mode.page,
    span,
    index: span === null ? -1 : drafts.spans.indexOf(span),
    selection,
    swapped,
    wide,
    sheeted: layout !== 'wide',
    openPage,
    go,
    select: setSelection,
    clearSelection: () => {
      setSelection(null);
    },
    toggleSwap: () => {
      setSwapped((shown) => !shown);
    },
  };
};

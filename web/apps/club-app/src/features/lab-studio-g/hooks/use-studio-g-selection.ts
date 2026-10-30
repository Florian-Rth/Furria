import { useState } from 'react';
import { useCloseOnEscape } from '@/features/events/hooks/use-close-on-escape';
import type { StudioGSelection } from '../studio-g-selection';
import { NO_SELECTION } from '../studio-g-selection';

export interface StudioGSelectionState {
  selection: StudioGSelection;
  select: (selection: StudioGSelection) => void;
  clear: () => void;
}

export const useStudioGSelection = (): StudioGSelectionState => {
  const [selection, setSelection] = useState<StudioGSelection>(NO_SELECTION);
  const clear = (): void => {
    setSelection(NO_SELECTION);
  };

  useCloseOnEscape(selection.kind !== 'none', clear);

  return { selection, select: setSelection, clear };
};

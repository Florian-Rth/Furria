import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useWebsitePictureAlt } from '../api';
import type { BoardPosition } from '../website-board';

export interface AltDraft {
  value: string;
  change: (value: string) => void;
  isChanged: boolean;
  isMissing: boolean;
  save: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export const useAltDraft = (position: BoardPosition): AltDraft => {
  const stored = position.picture?.alt ?? '';
  const [value, setValue] = useState(stored);
  const [shownStored, setShownStored] = useState(stored);
  if (shownStored !== stored) {
    setShownStored(stored);
    setValue(stored);
  }
  const mutation = useWebsitePictureAlt();
  const trimmed = value.trim();

  return {
    value,
    change: setValue,
    isChanged: trimmed !== stored,
    isMissing: trimmed.length === 0,
    save: () => {
      mutation.mutate({
        at: { slot: position.slot, position: position.position },
        alt: trimmed.length === 0 ? null : trimmed,
      });
    },
    isSaving: mutation.isPending,
    rejection: toWriteErrorMessage(mutation.error),
  };
};

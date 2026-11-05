import { useState } from 'react';
import { normalizeText } from '@/features/hall-plan/table-plan-ops';

export interface DraftText {
  value: string;
  change: (text: string) => void;
}

export const useDraftText = (value: string | null, commit: (text: string) => void): DraftText => {
  const [draft, setDraft] = useState(value ?? '');
  const [seen, setSeen] = useState(value);

  if (seen !== value) {
    setSeen(value);
    if (normalizeText(draft) !== value) {
      setDraft(value ?? '');
    }
  }

  return {
    value: draft,
    change: (text) => {
      setDraft(text);
      commit(text);
    },
  };
};

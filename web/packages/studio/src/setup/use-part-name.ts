import type { PartMoves } from '@furria/studio/use-part-moves';
import { useState } from 'react';

export interface PartName {
  value: string;
  placeholder: string;
  change: (value: string) => void;
  commit: () => void;
}

interface NameDraft {
  partId: number;
  name: string;
}

export const usePartName = (moves: PartMoves, partId: number | null): PartName => {
  const [draft, setDraft] = useState<NameDraft | null>(null);
  const name = moves.ranges.find((range) => range.partId === partId)?.name ?? '';

  return {
    value: draft !== null && draft.partId === partId ? draft.name : name,
    placeholder: name,
    change: (value) => {
      if (partId !== null) {
        setDraft({ partId, name: value });
      }
    },
    commit: () => {
      const trimmed = draft?.name.trim() ?? '';
      setDraft(null);
      if (partId !== null && draft?.partId === partId && trimmed !== '' && trimmed !== name) {
        moves.rename(partId, trimmed);
      }
    },
  };
};

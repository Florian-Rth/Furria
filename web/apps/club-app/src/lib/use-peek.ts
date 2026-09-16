import { useKkSheet } from '@furria/ui';
import { useState } from 'react';
import type { PeekKind } from './peek';
import { toPeekedId } from './peek';

export const usePeek = <TSubject>(
  kind: PeekKind,
  subjects: readonly TSubject[],
  idOf: (subject: TSubject) => number,
): TSubject | null => {
  const { openSheetId } = useKkSheet();
  const peekedId = toPeekedId(openSheetId, kind);
  const peeked = subjects.find((subject) => idOf(subject) === peekedId) ?? null;
  const [held, setHeld] = useState<TSubject | null>(null);

  if (peeked !== null && peeked !== held) {
    setHeld(peeked);
  }

  return peeked ?? held;
};

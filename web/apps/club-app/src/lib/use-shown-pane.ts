import { useState } from 'react';

export const useShownPane = <TPane>(
  pane: TPane | null,
  keyOf: (pane: TPane | null) => string,
): TPane | null => {
  const [kept, setKept] = useState<TPane | null>(pane);

  if (pane !== null && keyOf(pane) !== keyOf(kept)) {
    setKept(pane);
  }

  return pane ?? kept;
};

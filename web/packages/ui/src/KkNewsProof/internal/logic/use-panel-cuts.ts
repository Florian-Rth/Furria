import { useState } from 'react';
import type { KkNewsCutReport } from '../../../internal/news-surface/news-proofing';

export interface PanelCuts {
  isCut: boolean;
  report: KkNewsCutReport;
}

const withCut = (cuts: ReadonlySet<string>, key: string, cut: boolean): ReadonlySet<string> => {
  if (cuts.has(key) === cut) {
    return cuts;
  }
  const next = new Set(cuts);
  if (cut) {
    next.add(key);
  } else {
    next.delete(key);
  }
  return next;
};

export const usePanelCuts = (): PanelCuts => {
  const [cuts, setCuts] = useState<ReadonlySet<string>>(() => new Set());
  const [report] = useState<KkNewsCutReport>(() => (key: string, cut: boolean): void => {
    setCuts((current) => withCut(current, key, cut));
  });

  return { isCut: cuts.size > 0, report };
};

import { useEffect, useId } from 'react';
import { useNewsCutReport } from './news-proofing';

export const useReportedCut = (cut: boolean): void => {
  const key = useId();
  const report = useNewsCutReport();

  useEffect(() => {
    report?.(key, cut);
    return () => {
      report?.(key, false);
    };
  }, [report, key, cut]);
};

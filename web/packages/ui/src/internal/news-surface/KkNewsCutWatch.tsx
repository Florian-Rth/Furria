import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { KkNewsProofCutMark } from '../../KkNewsProof/internal/ui/KkNewsProofCutMark';
import { useNewsProofing } from './news-proofing';
import { useCutWatch } from './use-cut-watch';

export const KkNewsCutWatch: FC<PropsWithChildren> = ({ children }) => {
  const proofing = useNewsProofing();
  const watch = useCutWatch(proofing !== null);

  if (proofing === null) {
    return children;
  }
  const cutMark = watch.cut ? <KkNewsProofCutMark /> : null;

  return (
    <Box ref={watch.ref} sx={{ position: 'relative', minWidth: 0, maxWidth: '100%' }}>
      {children}
      {cutMark}
    </Box>
  );
};

import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { PROOF_PHONE_WIDTH } from '../logic/proof-phone-width';
import { useFitZoom } from '../logic/use-fit-zoom';

export const KkNewsProofScale: FC<PropsWithChildren> = ({ children }) => {
  const fit = useFitZoom(PROOF_PHONE_WIDTH);

  return (
    <Box ref={fit.ref} data-kk-news-proof-scale sx={{ minWidth: 0 }}>
      <Box sx={{ width: PROOF_PHONE_WIDTH, zoom: fit.zoom }}>{children}</Box>
    </Box>
  );
};

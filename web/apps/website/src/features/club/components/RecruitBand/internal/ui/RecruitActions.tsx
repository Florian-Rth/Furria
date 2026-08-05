import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { recruitBandContent } from '@/features/club/recruit-content';

export const RecruitActions: FC = () => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    sx={{
      position: 'relative',
      zIndex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <BandCta to={recruitBandContent.primaryTo}>{recruitBandContent.primaryLabel}</BandCta>
    <BandCta to={recruitBandContent.secondaryTo} emphasis="outlined">
      {recruitBandContent.secondaryLabel}
    </BandCta>
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import type { KkSx } from '../../../kk-sx';

interface KkBrandStageStatusProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkBrandStageStatus: FC<KkBrandStageStatusProps> = ({ sx, children }) => (
  <Stack
    role="status"
    aria-busy
    data-kk-brand-stage-status
    sx={[{ width: '100%', alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkEyebrow tone="muted">{children}</KkEyebrow>
  </Stack>
);

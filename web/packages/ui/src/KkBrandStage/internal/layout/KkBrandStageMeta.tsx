import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkBrandStageMetaProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkBrandStageMeta: FC<KkBrandStageMetaProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-brand-stage-meta
    sx={[
      {
        width: '100%',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        flexShrink: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

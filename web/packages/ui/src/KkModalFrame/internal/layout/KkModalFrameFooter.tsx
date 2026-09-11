import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';

export const KkModalFrameFooter: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-modal-frame-footer
    sx={(theme) => ({
      minWidth: 0,
      position: 'sticky',
      bottom: 0,
      mt: 'auto',
      pt: 1.5,
      gap: 1.25,
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: { desktop: 'flex-end' },
      ...raisedSurface(theme),
      '& > [data-kk-alert]': { flexBasis: '100%', order: -1 },
      '& > [data-kk-button]': { flex: { xs: '1 1 0', desktop: '0 0 auto' }, minWidth: 0 },
    })}
  >
    {children}
  </Stack>
);

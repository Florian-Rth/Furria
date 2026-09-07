import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const PANE_WIDTH = 'clamp(400px, 34vw, 480px)';
const SHEET_LIFT = `-${kkTokens.radius.base}px`;

export const KkSplitLayoutPane: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="section"
    data-kk-split-layout-pane
    sx={{
      position: 'relative',
      zIndex: 1,
      flex: { xs: '0 0 auto', desktop: `0 0 ${PANE_WIDTH}` },
      minWidth: 0,
      mt: { xs: SHEET_LIFT, desktop: 0 },
      justifyContent: 'center',
      gap: kkTokens.layout.fieldGap,
      px: { xs: 3, desktop: 5 },
      py: { xs: 4, desktop: 6 },
      bgcolor: 'background.default',
      borderTopLeftRadius: { xs: kkTokens.radius.base, desktop: 0 },
      borderTopRightRadius: { xs: kkTokens.radius.base, desktop: 0 },
    }}
  >
    {children}
  </Stack>
);

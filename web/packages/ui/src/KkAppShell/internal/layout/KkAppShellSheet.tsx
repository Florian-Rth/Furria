import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const MOBILE_BOTTOM_CLEARANCE = 9.5;

interface KkAppShellSheetProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellSheet: FC<KkAppShellSheetProps> = ({ sx, children }) => (
  <Stack
    data-kk-app-shell-sheet
    sx={[
      (theme) => ({
        flex: 1,
        minWidth: 0,
        bgcolor: 'background.default',
        ...theme.applyStyles('dark', {
          [theme.breakpoints.down('desktop')]: {
            borderTopLeftRadius: kkTokens.radius.base,
            borderTopRightRadius: kkTokens.radius.base,
            boxShadow: kkTokens.shadow.sheet,
          },
        }),
        px: { xs: 2.5, desktop: 5 },
        pt: { xs: 2.25, desktop: 3.75 },
        pb: { xs: MOBILE_BOTTOM_CLEARANCE, desktop: 3.75 },
        gap: { xs: 3, desktop: 4.25 },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

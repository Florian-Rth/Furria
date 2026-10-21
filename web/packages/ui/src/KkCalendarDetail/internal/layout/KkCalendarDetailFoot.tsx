import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import { safeArea } from '../../../internal/safe-area';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const FOOT_BOTTOM = 14;

interface KkCalendarDetailFootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarDetailFoot: FC<KkCalendarDetailFootProps> = ({ sx, children }) => (
  <Stack
    data-kk-calendar-detail-foot
    sx={[
      (theme) => ({
        flexShrink: 0,
        gap: 1,
        px: 2,
        pt: 1.5,
        pb: safeArea('bottom', FOOT_BOTTOM),
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderTopColor: (theme.vars ?? theme).palette.divider,
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
        ...raisedSurface(theme),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

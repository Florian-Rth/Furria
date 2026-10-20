import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkCalendarDetailFactsProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarDetailFacts: FC<KkCalendarDetailFactsProps> = ({ sx, children }) => (
  <Stack
    component="dl"
    data-kk-calendar-detail-facts
    sx={[
      (theme) => ({
        m: 0,
        minWidth: 0,
        '& > div + div': {
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: (theme.vars ?? theme).palette.divider,
        },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

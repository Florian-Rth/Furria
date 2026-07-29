import { KkEyebrow, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { membershipTicketNumberLabel } from '@/features/membership/ticket-content';

export const MembershipTicketNumberLine: FC = () => (
  <Stack direction="row" data-kk-membership-ticket-number sx={{ alignItems: 'baseline', gap: 1 }}>
    <KkEyebrow tone="onAccent">{membershipTicketNumberLabel}</KkEyebrow>
    <Box
      aria-hidden
      sx={(theme) => ({
        width: theme.spacing(9),
        borderBottomWidth: kkTokens.line.section,
        borderBottomStyle: 'dotted',
        borderBottomColor: 'currentColor',
        opacity: 0.55,
      })}
    />
  </Stack>
);

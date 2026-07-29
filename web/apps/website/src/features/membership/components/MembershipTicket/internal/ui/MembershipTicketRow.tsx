import { kkTokens } from '@furria/ui';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { MembershipTicketRow as MembershipTicketRowContent } from '@/features/membership/ticket-content';

interface MembershipTicketRowProps {
  row: MembershipTicketRowContent;
}

export const MembershipTicketRow: FC<MembershipTicketRowProps> = ({ row }) => (
  <Stack data-kk-membership-ticket-row sx={{ gap: 0 }}>
    <Divider sx={{ borderColor: 'currentColor', opacity: 0.3 }} />
    <Stack
      direction={{ xs: 'column', desktop: 'row' }}
      sx={{
        alignItems: { desktop: 'baseline' },
        gap: { xs: 0.25, desktop: 2 },
        py: { xs: 1.25, desktop: 1.5 },
      }}
    >
      <Typography
        component="span"
        variant="overline"
        sx={(theme) => ({
          ...kkTokens.eyebrow,
          opacity: 0.7,
          flexShrink: 0,
          width: { desktop: theme.spacing(15) },
        })}
      >
        {row.label}
      </Typography>
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 700, minWidth: 0, overflowWrap: 'anywhere', textWrap: 'pretty' }}
      >
        {row.value}
      </Typography>
    </Stack>
  </Stack>
);

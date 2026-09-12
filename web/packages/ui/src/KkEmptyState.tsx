import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { displayTitle } from './internal/display-title';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const MARK_SIZE = 116;

interface KkEmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkEmptyState: FC<KkEmptyStateProps> = ({ title, description, action, sx }) => (
  <Stack
    data-kk-empty-state
    sx={[
      {
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.5,
        minWidth: 0,
        px: 2.75,
        py: 4.25,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkBroomMark size={MARK_SIZE} sx={{ color: 'text.disabled' }} />
    <Typography component="p" sx={{ ...displayTitle, textWrap: 'balance' }}>
      {title}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: 'text.secondary', maxWidth: kkTokens.measure.empty, textWrap: 'pretty' }}
    >
      {description}
    </Typography>
    {action}
  </Stack>
);

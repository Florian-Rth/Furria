import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { displayTitle } from './internal/display-title';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const MARK_SIZE = 40;

interface KkErrorStateProps {
  title: string;
  description: string;
  action: ReactNode;
  sx?: KkSx;
}

export const KkErrorState: FC<KkErrorStateProps> = ({ title, description, action, sx }) => (
  <Stack
    role="alert"
    data-kk-error-state
    sx={[
      {
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.25,
        minWidth: 0,
        px: 2.75,
        py: 3,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkIcon name="alert" sx={{ color: 'error.main', fontSize: MARK_SIZE }} />
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

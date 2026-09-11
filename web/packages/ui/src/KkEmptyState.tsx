import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { inkWash } from './internal/ink-wash';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const TILE_SIZE = 52;
const TILE_WASH = '5%';
const DESCRIPTION_MAX_WIDTH = 300;

interface KkEmptyStateProps {
  icon: KkIconName;
  title: string;
  description: string;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkEmptyState: FC<KkEmptyStateProps> = ({ icon, title, description, action, sx }) => (
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
    <Stack
      aria-hidden
      sx={(theme) => ({
        width: TILE_SIZE,
        height: TILE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: inkWash(theme, TILE_WASH),
      })}
    >
      <KkIcon name={icon} size="large" sx={{ color: 'text.disabled' }} />
    </Stack>
    <Typography
      component="p"
      sx={{
        fontFamily: kkTokens.font.display,
        fontSize: '1.1875rem',
        letterSpacing: '0.03em',
        lineHeight: 1.15,
        color: 'text.primary',
        textTransform: 'uppercase',
        textWrap: 'balance',
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: 'text.secondary', maxWidth: DESCRIPTION_MAX_WIDTH, textWrap: 'pretty' }}
    >
      {description}
    </Typography>
    {action}
  </Stack>
);

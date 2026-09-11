import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { displayTitle } from './internal/display-title';
import { inkWashSurface } from './internal/ink-wash';
import { KkBroomMark } from './KkBroomMark';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const TILE_SIZE = 52;
const TILE_WASH_LIGHT = '8%';
const TILE_WASH_DARK = '14%';
const WATERMARK_SIZE = 116;

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
      sx={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}
    >
      <KkBroomMark
        size={WATERMARK_SIZE}
        sx={{
          position: 'absolute',
          color: 'text.primary',
          opacity: kkTokens.opacity.watermark,
          pointerEvents: 'none',
        }}
      />
      <Stack
        sx={(theme) => ({
          position: 'relative',
          width: TILE_SIZE,
          height: TILE_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          ...inkWashSurface(theme, TILE_WASH_LIGHT, TILE_WASH_DARK),
        })}
      >
        <KkIcon name={icon} size="large" sx={{ color: 'text.secondary' }} />
      </Stack>
    </Stack>
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

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { displayTitle } from './internal/display-title';
import { inkWashSurface } from './internal/ink-wash';
import { KkChip } from './KkChip';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkPanel } from './KkPanel';
import type { KkSx } from './kk-sx';

const TILE_SIZE = 30;
const TILE_WASH_LIGHT = '8%';
const TILE_WASH_DARK = '14%';

interface KkReservedSlotProps {
  icon: KkIconName;
  title: string;
  description: string;
  badge?: string;
  sx?: KkSx;
}

export const KkReservedSlot: FC<KkReservedSlotProps> = ({
  icon,
  title,
  description,
  badge,
  sx,
}) => {
  const badgeChip =
    badge === undefined ? null : (
      <KkChip tone="neutral" size="small">
        {badge}
      </KkChip>
    );

  return (
    <KkPanel variant="block" tone="reserved" sx={sx}>
      <Stack
        direction="row"
        data-kk-reserved-slot
        sx={{ alignItems: 'flex-start', gap: 1.375, minWidth: 0 }}
      >
        <Stack
          aria-hidden
          sx={(theme) => ({
            width: TILE_SIZE,
            height: TILE_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: '50%',
            ...inkWashSurface(theme, TILE_WASH_LIGHT, TILE_WASH_DARK),
          })}
        >
          <KkIcon name={icon} size="small" sx={{ color: 'text.secondary' }} />
        </Stack>
        <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.625 }}>
          <Typography component="p" sx={displayTitle}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
            {description}
          </Typography>
        </Stack>
        {badgeChip}
      </Stack>
    </KkPanel>
  );
};

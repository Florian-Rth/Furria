import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkChipSize } from './internal/chip-size';
import { chipSizeMetrics } from './internal/chip-size';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkGroupToneChipProps extends PropsWithChildren {
  tone: KkGroupTone;
  size?: KkChipSize;
  sx?: KkSx;
}

export const KkGroupToneChip: FC<KkGroupToneChipProps> = ({
  tone,
  size = 'medium',
  sx,
  children,
}) => (
  <Stack
    component="span"
    direction="row"
    data-kk-group-tone-chip
    sx={[
      (theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        gap: 0.75,
        borderRadius: `${kkTokens.radius.chip}px`,
        ...theme.typography.caption,
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.2,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...chipSizeMetrics[size],
        ...groupToneFieldPaint(theme, tone),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabRowProps {
  rowRef: (element: Element | null) => void;
  handleRef: (element: Element | null) => void;
  position: number;
  label: string;
  detail: string;
  handleLabel: string;
  dragging: boolean;
}

export const KkTouchLabRow: FC<KkTouchLabRowProps> = ({
  rowRef,
  handleRef,
  position,
  label,
  detail,
  handleLabel,
  dragging,
}) => (
  <Stack
    direction="row"
    ref={rowRef}
    data-dragging={dragging}
    sx={(theme) => ({
      minHeight: kkTokens.tapTarget,
      alignItems: 'center',
      gap: 1.25,
      pl: 1.5,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: touchLabPalette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).divider}`,
      '&[data-dragging="true"]': { boxShadow: kkTokens.shadow.floating, zIndex: 3 },
    })}
  >
    <Typography
      variant="body2"
      sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}
    >
      {position}
    </Typography>
    <Box sx={{ flex: 1, minWidth: 0, py: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {detail}
      </Typography>
    </Box>
    <Box
      ref={handleRef}
      role="button"
      aria-label={handleLabel}
      sx={{
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        display: 'grid',
        placeItems: 'center',
        color: 'text.secondary',
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <KkIcon name="drag" />
    </Box>
  </Stack>
);

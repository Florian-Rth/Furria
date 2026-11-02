import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabSlotProps extends PropsWithChildren {
  slotRef: (element: Element | null) => void;
  label: string;
  over: boolean;
}

export const KkTouchLabSlot: FC<KkTouchLabSlotProps> = ({ slotRef, label, over, children }) => (
  <Stack
    ref={slotRef}
    data-over={over}
    sx={(theme) => ({
      minHeight: '3.5rem',
      p: 0.75,
      gap: 0.5,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: touchLabPalette(theme).action.hover,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).divider}`,
      transition: 'box-shadow 120ms ease-out',
      '&[data-over="true"]': {
        boxShadow: `inset 0 0 0 ${kkTokens.line.page}px ${touchLabPalette(theme).primary.main}`,
      },
    })}
  >
    <Typography
      variant="caption"
      sx={{ fontWeight: 900, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
    >
      {label}
    </Typography>
    {children}
  </Stack>
);

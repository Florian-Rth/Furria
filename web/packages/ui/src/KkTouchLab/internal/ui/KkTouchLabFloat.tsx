import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabFloatProps extends PropsWithChildren {
  x: number;
  y: number;
  label: string;
}

export const KkTouchLabFloat: FC<KkTouchLabFloatProps> = ({ x, y, label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-gesture-ignore
    style={{ left: x, top: y }}
    sx={(theme) => ({
      position: 'absolute',
      zIndex: 6,
      transform: 'translate(-50%, -100%)',
      p: 0.5,
      gap: 0.5,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: touchLabPalette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).divider}, ${kkTokens.shadow.floating}`,
    })}
  >
    {children}
  </Stack>
);

import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabKeyState = 'idle' | 'selected' | 'lifted';

export interface KkTouchLabKey {
  key: string;
  x: number;
  state: KkTouchLabKeyState;
}

interface KkTouchLabKeysProps {
  keys: readonly KkTouchLabKey[];
}

export const KkTouchLabKeys: FC<KkTouchLabKeysProps> = ({ keys }) => (
  <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {keys.map((key) => (
      <Box
        key={key.key}
        data-state={key.state}
        style={{ transform: `translate3d(${key.x}px, 0, 0) translate(-50%, -50%) rotate(45deg)` }}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: '50%',
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: touchLabPalette(theme).text.secondary,
          '&[data-state="selected"]': { backgroundColor: touchLabPalette(theme).primary.main },
          '&[data-state="lifted"]': {
            backgroundColor: touchLabPalette(theme).primary.main,
            scale: '1.5',
            boxShadow: kkTokens.shadow.floating,
          },
        })}
      />
    ))}
  </Box>
);

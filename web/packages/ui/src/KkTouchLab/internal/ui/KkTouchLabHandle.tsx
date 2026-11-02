import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabHandleKind = 'border' | 'cut';

interface KkTouchLabHandleProps {
  x: number;
  kind: KkTouchLabHandleKind;
  active: boolean;
}

export const KkTouchLabHandle: FC<KkTouchLabHandleProps> = ({ x, kind, active }) => (
  <Box
    aria-hidden
    data-kind={kind}
    data-active={active}
    style={{ left: x }}
    sx={(theme) => ({
      position: 'absolute',
      top: kind === 'border' ? '0.25rem' : 0,
      bottom: kind === 'border' ? '55%' : 0,
      width: 0,
      pointerEvents: 'none',
      borderLeft: `${kkTokens.line.section}px solid ${touchLabPalette(theme).text.primary}`,
      color: touchLabPalette(theme).text.primary,
      '&[data-kind="cut"]': {
        borderLeftStyle: 'dashed',
        borderLeftColor: touchLabPalette(theme).warning.main,
        color: touchLabPalette(theme).warning.main,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        left: '50%',
        bottom: kind === 'border' ? '-1rem' : '0.5rem',
        width: '0.75rem',
        height: '1.5rem',
        transform: 'translateX(-50%)',
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: touchLabPalette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.section}px currentColor, ${kkTokens.shadow.rest}`,
        transition: kkTokens.motion.press,
      },
      '&[data-active="true"]': {
        borderLeftColor: touchLabPalette(theme).primary.main,
        color: touchLabPalette(theme).primary.main,
      },
      '&[data-active="true"]::after': { transform: 'translateX(-50%) scale(1.35)' },
    })}
  />
);

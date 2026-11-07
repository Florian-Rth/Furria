import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkTimelineBracketEdgeSide = 'start' | 'end';

interface KkTimelineBracketEdgeProps {
  side: KkTimelineBracketEdgeSide;
  active: boolean;
}

const PLACES: Record<
  KkTimelineBracketEdgeSide,
  { left?: number; right?: number; transform: string }
> = {
  start: { left: 0, transform: 'translateX(-50%)' },
  end: { right: 0, transform: 'translateX(50%)' },
};

export const KkTimelineBracketEdge: FC<KkTimelineBracketEdgeProps> = ({ side, active }) => (
  <Box
    aria-hidden
    data-kk-timeline-bracket-edge={side}
    data-active={active}
    sx={(theme) => ({
      position: 'absolute',
      top: '25%',
      bottom: '25%',
      ...PLACES[side],
      width: kkTokens.line.page * 2,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: palette(theme).text.primary,
      transition: 'top 120ms ease-out, bottom 120ms ease-out, background-color 120ms ease-out',
      '&[data-active="true"]': {
        top: '12%',
        bottom: '12%',
        backgroundColor: palette(theme).text.primary,
      },
    })}
  />
);

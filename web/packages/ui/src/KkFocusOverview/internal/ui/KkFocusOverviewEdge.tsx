import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkFocusOverviewEdgeSide = 'start' | 'end';

interface KkFocusOverviewEdgeProps {
  side: KkFocusOverviewEdgeSide;
  onMove: (side: KkFocusOverviewEdgeSide, share: number) => void;
  onEnd: () => void;
}

export const KkFocusOverviewEdge: FC<KkFocusOverviewEdgeProps> = ({ side, onMove, onEnd }) => {
  const move = (share: KkStudioShare): void => {
    onMove(side, share.x);
  };
  const drag = useStudioDrag({ onMove: move, onEnd });

  return (
    <Box
      aria-hidden
      {...drag}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side === 'start' ? 'left' : 'right']: '-0.75rem',
        width: '1.5rem',
        cursor: 'ew-resize',
        touchAction: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '25%',
          bottom: '25%',
          left: '50%',
          width: kkTokens.line.page * 2,
          transform: 'translateX(-50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: palette(theme).text.primary,
        },
      })}
    />
  );
};

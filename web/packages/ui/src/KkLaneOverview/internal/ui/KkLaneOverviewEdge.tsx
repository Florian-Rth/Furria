import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkLaneOverviewEdgeSide = 'start' | 'end';

interface KkLaneOverviewEdgeProps {
  side: KkLaneOverviewEdgeSide;
  onMove: (side: KkLaneOverviewEdgeSide, share: number) => void;
  onEnd: () => void;
}

export const KkLaneOverviewEdge: FC<KkLaneOverviewEdgeProps> = ({ side, onMove, onEnd }) => {
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
        [side === 'start' ? 'left' : 'right']: 'calc(-1 * min(0.75rem, 20%))',
        width: 'min(1.5rem, 40%)',
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

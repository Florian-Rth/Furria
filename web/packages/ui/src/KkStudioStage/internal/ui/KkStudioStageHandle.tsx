import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioStageHandleProps {
  x: number;
  y: number;
  label: string;
  onPress: () => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
}

export const KkStudioStageHandle: FC<KkStudioStageHandleProps> = ({
  x,
  y,
  label,
  onPress,
  onMove,
  onEnd,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });

  return (
    <Box
      role="button"
      aria-label={label}
      data-kk-studio-handle
      {...drag}
      style={{
        transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
      }}
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        display: 'grid',
        placeItems: 'center',
        touchAction: 'none',
        cursor: 'grab',
        zIndex: 2,
      }}
    >
      <Box
        sx={(theme) => ({
          width: '0.875rem',
          height: '0.875rem',
          borderRadius: '50%',
          backgroundColor: palette(theme).background.paper,
          border: `${kkTokens.line.section}px solid ${palette(theme).primary.main}`,
          boxShadow: kkTokens.shadow.rest,
          transition: 'transform 160ms ease-out',
          '[data-kk-studio-handle]:hover > &, [data-kk-studio-handle]:active > &': {
            transform: 'scale(1.25)',
          },
        })}
      />
    </Box>
  );
};

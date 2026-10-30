import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkStudioWaveHandleEdge = 'start' | 'end';

interface KkStudioWaveHandleProps {
  share: number;
  edge: KkStudioWaveHandleEdge;
  label: string;
  active: boolean;
  onMove: (share: number) => void;
  onEnd: () => void;
}

export const KkStudioWaveHandle: FC<KkStudioWaveHandleProps> = ({
  share,
  edge,
  label,
  active,
  onMove,
  onEnd,
}) => {
  const drag = useStudioDrag({
    onMove: (point) => {
      onMove(point.x);
    },
    onEnd,
  });
  const place = { left: `${share * PERCENT}%` };

  return (
    <Box
      role="slider"
      aria-label={label}
      aria-valuenow={Math.round(share * PERCENT)}
      tabIndex={0}
      data-kk-studio-handle={edge}
      data-active={active}
      {...drag}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: '2.75rem',
        bottom: '2rem',
        width: kkTokens.tapTarget,
        transform: 'translateX(-50%)',
        display: 'grid',
        placeItems: 'center',
        touchAction: 'none',
        cursor: 'ew-resize',
        zIndex: 2,
        ...focusRing(theme),
      })}
    >
      <Box
        sx={(theme) => ({
          width: '0.625rem',
          height: '58%',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: palette(theme).warning.main,
          boxShadow: `0 0 0 ${kkTokens.line.section}px ${palette(theme).background.paper}, ${kkTokens.shadow.rest}`,
          transition: 'transform 160ms ease-out',
          '[data-active="true"] > &': { transform: 'scaleX(1.4)' },
        })}
      />
    </Box>
  );
};

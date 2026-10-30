import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { pointOf } from '../logic/studio-g-lane-kinds';
import type { KkStudioGDrag } from '../logic/use-drag-delta';
import { useDragDelta } from '../logic/use-drag-delta';

interface KkStudioGTimelineMarkProps {
  seconds: number;
  label: string;
  dragging: boolean;
  onDrag: KkStudioGDrag;
}

export const KkStudioGTimelineMark: FC<KkStudioGTimelineMarkProps> = ({
  seconds,
  label,
  dragging,
  onDrag,
}) => {
  const drag = useDragDelta(onDrag);

  return (
    <Box
      role="slider"
      aria-label={label}
      aria-valuenow={Math.round(seconds * 100) / 100}
      tabIndex={-1}
      {...drag}
      data-kk-studio-g-mark
      data-dragging={dragging}
      style={pointOf(seconds)}
      sx={(theme) => ({
        position: 'absolute',
        top: '-0.25rem',
        bottom: '-0.25rem',
        width: '1.75rem',
        transform: 'translateX(-50%)',
        cursor: 'ew-resize',
        touchAction: 'none',
        zIndex: 3,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: kkTokens.line.page,
          transform: 'translateX(-50%)',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: (theme.vars ?? theme).palette.text.primary,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '0.75rem',
          height: '1.25rem',
          transform: 'translate(-50%, -50%)',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: (theme.vars ?? theme).palette.background.paper,
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${(theme.vars ?? theme).palette.text.primary}, ${kkTokens.shadow.rest}`,
          transition: kkTokens.motion.press,
        },
        '&[data-dragging="true"]::after': { transform: 'translate(-50%, -50%) scale(1.15)' },
      })}
    />
  );
};

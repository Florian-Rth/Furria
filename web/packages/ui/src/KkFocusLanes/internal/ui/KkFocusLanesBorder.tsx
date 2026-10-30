import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesBorderProps {
  share: number;
  label: string;
  text: string;
  active: boolean;
  onMove: (share: number) => void;
  onEnd: () => void;
  onNudge: (direction: -1 | 1) => void;
}

export const KkFocusLanesBorder: FC<KkFocusLanesBorderProps> = ({
  share,
  label,
  text,
  active,
  onMove,
  onEnd,
  onNudge,
}) => {
  const move = (point: KkStudioShare): void => {
    onMove(point.x);
  };
  const drag = useStudioDrag({ onMove: move, onEnd });
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      onNudge(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };
  const bubble = active ? (
    <Typography
      component="span"
      variant="caption"
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        px: 0.5,
        borderRadius: `${kkTokens.radius.bar}px`,
        fontWeight: 800,
        lineHeight: '1.125rem',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        color: palette(theme).primary.contrastText,
        backgroundColor: palette(theme).primary.main,
      })}
    >
      {text}
    </Typography>
  ) : null;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-roledescription="verschiebbar"
      aria-description={text}
      data-active={active}
      {...drag}
      onKeyDown={press}
      style={{ left: `${share * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '1.5rem',
        transform: 'translateX(-50%)',
        cursor: 'ew-resize',
        touchAction: 'none',
        zIndex: 2,
        '&::after': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: '1.125rem',
          bottom: '0.25rem',
          width: kkTokens.line.page,
          transform: 'translateX(-50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: palette(theme).background.paper,
          boxShadow: `0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          transition: 'background-color 120ms ease-out',
        },
        '&:hover::after, &[data-active="true"]::after': {
          backgroundColor: palette(theme).primary.main,
        },
        ...focusRing(theme),
      })}
    >
      {bubble}
    </Box>
  );
};

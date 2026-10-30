import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioIShare } from '../../../KkStudioIDrag/use-kk-studio-i-drag';
import { useKkStudioIDrag } from '../../../KkStudioIDrag/use-kk-studio-i-drag';

const PERCENT = 100;
const FIELD = '[data-kk-studio-i-field]';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIWaveMarkProps {
  share: number;
  edge: 'start' | 'end';
  text: string;
  label: string;
  selected: boolean;
  movable: boolean;
  onPress: () => void;
  onDrag: (share: number) => void;
}

export const KkStudioIWaveMark: FC<KkStudioIWaveMarkProps> = ({
  share,
  edge,
  text,
  label,
  selected,
  movable,
  onPress,
  onDrag,
}) => {
  const drag = (to: KkStudioIShare): void => {
    onDrag(to.x);
  };
  const handlers = useKkStudioIDrag(FIELD, onPress, movable ? drag : undefined);
  const ink = (theme: Theme): string =>
    selected ? palette(theme).primary.main : palette(theme).text.primary;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      data-kk-studio-i-mark={edge}
      data-selected={selected}
      {...handlers}
      style={{ left: `${share * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '2.75rem',
        transform: 'translateX(-50%)',
        cursor: movable ? 'ew-resize' : 'pointer',
        touchAction: 'none',
        zIndex: selected ? 3 : 2,
        borderRadius: '0.25rem',
        ...focusRing(theme),
      })}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: '50%',
          top: '1.25rem',
          bottom: 0,
          width: selected ? '3px' : '2px',
          transform: 'translateX(-50%)',
          backgroundColor: ink(theme),
        })}
      />
      <Typography
        component="span"
        variant="caption"
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          ...(edge === 'start' ? { left: '50%' } : { right: '50%' }),
          px: 0.5,
          height: '1.25rem',
          display: 'grid',
          alignItems: 'center',
          lineHeight: 1,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          borderRadius: edge === 'start' ? '0 0.25rem 0.25rem 0' : '0.25rem 0 0 0.25rem',
          color: selected ? palette(theme).primary.contrastText : palette(theme).background.paper,
          backgroundColor: ink(theme),
        })}
      >
        {text}
      </Typography>
    </Box>
  );
};

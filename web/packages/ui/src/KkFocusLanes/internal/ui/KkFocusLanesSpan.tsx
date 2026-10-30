import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { tonePaint } from '../../../internal/tone';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesSpanProps {
  start: number;
  end: number;
  text: string;
  label: string;
  selected: boolean;
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
}

export const KkFocusLanesSpan: FC<KkFocusLanesSpanProps> = ({
  start,
  end,
  text,
  label,
  selected,
  onPress,
  onMove,
  onEnd,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });

  return (
    <Stack
      direction="row"
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      data-selected={selected}
      {...drag}
      style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: '0.375rem',
        bottom: '0.375rem',
        alignItems: 'center',
        px: 0.75,
        minWidth: 0,
        cursor: 'grab',
        touchAction: 'none',
        borderRadius: `${kkTokens.radius.bar * 2}px`,
        ...tonePaint(theme, 'blue'),
        '&[data-selected="true"]': {
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
        },
        ...focusRing(theme),
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontWeight: 800,
          color: 'inherit',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
};

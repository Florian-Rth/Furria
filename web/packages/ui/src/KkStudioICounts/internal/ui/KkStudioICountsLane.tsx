import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioIShare } from '../../../KkStudioIDrag/use-kk-studio-i-drag';
import { useKkStudioIDrag } from '../../../KkStudioIDrag/use-kk-studio-i-drag';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;
const FIELD = '[data-kk-studio-i-counts-field]';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioICountsLaneProps {
  from: number;
  to: number;
  text: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  onDragStart?: (share: number) => void;
}

export const KkStudioICountsLane: FC<KkStudioICountsLaneProps> = ({
  from,
  to,
  text,
  label,
  selected,
  onPress,
  onDragStart,
}) => {
  const drag =
    onDragStart === undefined
      ? undefined
      : (share: KkStudioIShare): void => {
          onDragStart(share.x);
        };
  const handlers = useKkStudioIDrag(FIELD, onPress, drag);
  const span = { left: `${from * PERCENT}%`, width: `${Math.max(0, to - from) * PERCENT}%` };
  const grip =
    onDragStart === undefined ? null : (
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: '-0.125rem',
          bottom: '-0.125rem',
          width: '0.375rem',
          borderRadius: '0.1875rem',
          backgroundColor: palette(theme).text.primary,
        })}
      />
    );

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      data-kk-studio-i-lane
      data-selected={selected}
      {...handlers}
      style={span}
      sx={(theme) => ({
        position: 'absolute',
        bottom: '0.3125rem',
        height: '1.125rem',
        minWidth: '0.75rem',
        display: 'grid',
        alignItems: 'center',
        px: 0.75,
        borderRadius: `${kkTokens.radius.bar}px`,
        cursor: onDragStart === undefined ? 'pointer' : 'ew-resize',
        touchAction: 'none',
        backgroundColor: selected
          ? palette(theme).primary.main
          : `color-mix(in srgb, ${palette(theme).text.primary} 16%, transparent)`,
        color: selected ? palette(theme).primary.contrastText : palette(theme).text.primary,
        ...focusRing(theme),
      })}
    >
      {grip}
      <Typography
        component="span"
        variant="caption"
        sx={{
          lineHeight: 1,
          fontWeight: 800,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

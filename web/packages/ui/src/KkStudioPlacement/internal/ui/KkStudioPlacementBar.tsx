import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioPlacementBarProps {
  start: number;
  end: number;
  label: string;
  selected: boolean;
  onPress: (share: KkStudioShare) => void;
  onMove: (share: KkStudioShare) => void;
  onEnd: () => void;
}

export const KkStudioPlacementBar: FC<KkStudioPlacementBarProps> = ({
  start,
  end,
  label,
  selected,
  onPress,
  onMove,
  onEnd,
}) => {
  const drag = useStudioDrag({ onPress, onMove, onEnd });

  return (
    <Box
      role="button"
      aria-label={label}
      aria-pressed={selected}
      data-kk-studio-video-bar
      data-selected={selected}
      {...drag}
      style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: '0.25rem',
        height: '1.25rem',
        display: 'grid',
        alignItems: 'center',
        pl: 0.5,
        borderRadius: `${kkTokens.radius.bar + 1}px`,
        color: palette(theme).text.primary,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 16%, transparent)`,
        touchAction: 'none',
        cursor: 'grab',
        transition: 'background-color 160ms ease-out, color 160ms ease-out',
        '&[data-selected="true"]': {
          color: palette(theme).background.paper,
          backgroundColor: palette(theme).text.primary,
          zIndex: 2,
        },
      })}
    >
      <VideocamRoundedIcon fontSize="inherit" />
    </Box>
  );
};

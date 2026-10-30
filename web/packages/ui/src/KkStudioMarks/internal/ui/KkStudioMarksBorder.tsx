import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioMarksBorderProps {
  share: number;
  label: string;
  text: string;
  active: boolean;
  onMove: (share: number) => void;
  onEnd: () => void;
}

export const KkStudioMarksBorder: FC<KkStudioMarksBorderProps> = ({
  share,
  label,
  text,
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

  return (
    <Box
      role="slider"
      aria-label={label}
      aria-valuetext={text}
      aria-valuenow={Math.round(share * PERCENT)}
      tabIndex={0}
      data-kk-studio-border
      data-active={active}
      {...drag}
      style={{ left: `${share * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: '1.125rem',
        bottom: '-0.375rem',
        width: '2rem',
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
          width: '0.375rem',
          height: '2.25rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: palette(theme).text.primary,
          boxShadow: `0 0 0 ${kkTokens.line.section}px ${palette(theme).background.default}`,
          transition: 'transform 160ms ease-out',
          '[data-active="true"] > &': { transform: 'scaleX(1.5)' },
        })}
      />
      <Typography
        component="span"
        variant="caption"
        sx={(theme) => ({
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translate(-50%, -0.25rem)',
          px: 0.75,
          borderRadius: `${kkTokens.radius.pill}px`,
          fontWeight: 900,
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          color: palette(theme).background.paper,
          backgroundColor: palette(theme).text.primary,
          opacity: 0,
          transition: 'opacity 160ms ease-out',
          '[data-active="true"] > &': { opacity: 1 },
        })}
      >
        {text}
      </Typography>
    </Box>
  );
};

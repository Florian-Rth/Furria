import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export interface KkStudioETransportShare {
  key: string;
  start: number;
  end: number;
}

const PERCENT = 100;
const TRACK = '0.25rem';
const CUT = '0.1875rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioETransportProgressProps {
  value: number;
  stops: readonly KkStudioETransportShare[];
  loop: KkStudioETransportShare | null;
  label: string;
  onSeek: (share: number) => void;
}

export const KkStudioETransportProgress: FC<KkStudioETransportProgressProps> = ({
  value,
  stops,
  loop,
  label,
  onSeek,
}) => {
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    onSeek(box.width <= 0 ? 0 : (event.clientX - box.left) / box.width);
  };
  const fill = { transform: `scaleX(${Math.min(1, Math.max(0, value))})` };
  const cuts = stops
    .filter((stop) => stop.start > 0)
    .map((stop) => (
      <Box
        key={stop.key}
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${stop.start * PERCENT}%`,
          width: CUT,
          transform: 'translateX(-50%)',
          backgroundColor: palette(theme).background.default,
        })}
      />
    ));
  const band =
    loop === null ? null : (
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          top: '50%',
          height: '0.875rem',
          left: `${loop.start * PERCENT}%`,
          width: `${(loop.end - loop.start) * PERCENT}%`,
          transform: 'translateY(-50%)',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 22%, transparent)`,
        })}
      />
    );

  return (
    <ButtonBase
      component="div"
      aria-label={label}
      onClick={handleClick}
      data-kk-studio-e-progress
      sx={(theme) => ({
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '1.5rem',
        borderRadius: `${kkTokens.radius.pill}px`,
        ...focusRing(theme),
      })}
    >
      {band}
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: TRACK,
          transform: 'translateY(-50%)',
          borderRadius: `${kkTokens.radius.pill}px`,
          overflow: 'clip',
          backgroundColor: palette(theme).divider,
        })}
      >
        <Box
          style={fill}
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            transformOrigin: 'left center',
            backgroundColor: palette(theme).primary.main,
            willChange: 'transform',
          })}
        />
        {cuts}
      </Box>
    </ButtonBase>
  );
};

import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, waveTop } from '../timeline-paint';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkTimelineHandleProps {
  share: number;
  label: string;
  valueText: string;
  active: boolean;
  onNudge: (direction: -1 | 1) => void;
}

export const KkTimelineHandle: FC<KkTimelineHandleProps> = ({
  share,
  label,
  valueText,
  active,
  onNudge,
}) => {
  const place = { left: percentOf(share) };
  const percent = Math.round(share * PERCENT);
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !event.repeat) {
      event.preventDefault();
      event.stopPropagation();
      onNudge(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };

  return (
    <Box
      role="slider"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuetext={valueText}
      aria-valuemin={0}
      aria-valuemax={PERCENT}
      tabIndex={0}
      onKeyDown={press}
      data-kk-timeline-handle
      data-active={active}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: waveTop,
        bottom: `var(${LANE_VARS.steps})`,
        width: kkTokens.tapTarget,
        transform: 'translateX(-50%)',
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        zIndex: 2,
        ...focusRing(theme),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          borderLeft: `${kkTokens.line.section}px solid ${palette(theme).warning.main}`,
          transform: 'translateX(-50%)',
        },
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

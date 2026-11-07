import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, videosTop } from '../timeline-paint';
import { CUT_LABEL, watchWholeLabel } from '../watch-whole-label';

const INSET = '0.1875rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkTimelineSoundBandProps {
  start: number;
  end: number;
  title: string;
  active: boolean;
}

export const KkTimelineSoundBand: FC<KkTimelineSoundBandProps> = ({
  start,
  end,
  title,
  active,
}) => {
  const place = { left: percentOf(start), width: percentOf(Math.max(0, end - start)) };

  return (
    <Box
      aria-hidden
      data-kk-timeline-sound-band
      data-active={active}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: `calc(${videosTop} + ${INSET})`,
        height: `calc(var(${LANE_VARS.videos}) - ${INSET} * 2)`,
        borderRadius: `${kkTokens.radius.bar}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).info.main} 10%, transparent)`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px color-mix(in srgb, ${palette(theme).info.main} 45%, transparent)`,
        pointerEvents: 'none',
        containerType: 'inline-size',
        '&[data-active="true"]': {
          boxShadow: `inset 0 0 0 ${kkTokens.line.page}px ${palette(theme).info.main}`,
        },
      })}
    >
      <Typography
        component="span"
        variant="caption"
        noWrap
        ref={watchWholeLabel}
        sx={(theme) => ({
          ...CUT_LABEL,
          position: 'absolute',
          top: INSET,
          left: INSET,
          maxWidth: `calc(100% - ${INSET} * 2)`,
          px: 0.5,
          py: 0.25,
          zIndex: 1,
          lineHeight: 1,
          fontWeight: 800,
          borderRadius: `${kkTokens.radius.bar}px`,
          color: palette(theme).text.primary,
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 85%, transparent)`,
          '@container (max-width: 4.5rem)': { display: 'none' },
        })}
      >
        {title}
      </Typography>
    </Box>
  );
};

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkGroupTone } from '../../../internal/group-tone';
import { shadeFill, shadeWash } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, waveTop } from '../timeline-paint';

export interface KkTimelinePart {
  key: number;
  label: string;
  hint?: string;
  from: number;
  to: number;
  shade: number;
  current?: boolean;
}

interface KkTimelinePartBandProps {
  part: KkTimelinePart;
  tone: KkGroupTone | null;
  place: { left: string; width: string };
  lane: string | undefined;
  onSelect: ((key: number) => void) | undefined;
}

export const KkTimelinePartBand: FC<KkTimelinePartBandProps> = ({
  part,
  tone,
  place,
  lane,
  onSelect,
}) => {
  const current = part.current === true;
  const chipTop = onSelect === undefined ? `calc(var(${LANE_VARS.ruler}) + 2px)` : '2px';
  const select = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    onSelect?.(part.key);
  };
  const wash = (
    <Box
      component="span"
      data-kk-timeline-part-wash
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: waveTop,
        bottom: 0,
        ...shadeWash(theme, tone, part.shade),
      })}
    />
  );
  const chip = (
    <Box
      component="span"
      data-kk-timeline-part
      data-timeline-lane={lane}
      data-current={current}
      sx={(theme) => ({
        position: 'absolute',
        left: kkTokens.line.hair,
        right: kkTokens.line.hair,
        top: chipTop,
        height: `calc(var(${LANE_VARS.parts}) - 4px)`,
        display: 'grid',
        alignItems: 'center',
        px: 0.75,
        borderRadius: `${kkTokens.radius.bar}px`,
        typography: 'caption',
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.label,
        textTransform: 'uppercase',
        textAlign: 'left',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        overflow: 'clip',
        textOverflow: 'ellipsis',
        ...shadeFill(theme, tone, part.shade),
        '&[data-current="true"]': {
          boxShadow: `inset 0 -${kkTokens.line.page}px 0 ${(theme.vars ?? theme).palette.primary.main}`,
        },
      })}
    >
      {part.label}
    </Box>
  );

  if (onSelect === undefined) {
    return (
      <Box component="span" style={place} sx={{ position: 'absolute', inset: 0 }}>
        {wash}
        {chip}
      </Box>
    );
  }

  return (
    <Box component="span" style={place} sx={{ position: 'absolute', inset: 0 }}>
      {wash}
      <ButtonBase
        aria-label={part.hint ?? part.label}
        onClick={select}
        data-kk-timeline-part-button
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          top: `var(${LANE_VARS.ruler})`,
          bottom: `var(${LANE_VARS.steps})`,
          pointerEvents: 'auto',
          display: 'block',
          ...focusRing(theme),
        })}
      >
        {chip}
      </ButtonBase>
    </Box>
  );
};

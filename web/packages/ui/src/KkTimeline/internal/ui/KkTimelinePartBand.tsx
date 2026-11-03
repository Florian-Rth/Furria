import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { motion } from 'motion/react';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkGroupTone } from '../../../internal/group-tone';
import { shadeFill, shadeWash } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, stepsBottom, waveBottom, waveTop } from '../timeline-paint';
import type { KkTimelinePan } from '../use-sticky-name';
import { useStickyName } from '../use-sticky-name';

export interface KkTimelinePart {
  key: number;
  label: string;
  hint?: string;
  from: number;
  to: number;
  shade: number;
  current?: boolean;
  selected?: boolean;
}

interface KkTimelinePartBandProps {
  part: KkTimelinePart;
  tone: KkGroupTone | null;
  place: { left: string; width: string };
  lane: string | undefined;
  pan: KkTimelinePan | null;
  onSelect: ((key: number) => void) | undefined;
}

export const KkTimelinePartBand: FC<KkTimelinePartBandProps> = ({
  part,
  tone,
  place,
  lane,
  pan,
  onSelect,
}) => {
  const current = part.current === true;
  const selected = part.selected === true;
  const sticky = useStickyName(pan, part.from);
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
        bottom: stepsBottom,
        ...shadeWash(theme, tone, part.shade),
      })}
    />
  );
  const chip = (
    <Box
      component="span"
      data-kk-timeline-part
      ref={sticky.chipRef}
      data-timeline-lane={lane}
      data-current={current}
      data-selected={selected}
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
        '&[data-selected="true"]': {
          outline: `${kkTokens.line.section}px solid ${(theme.vars ?? theme).palette.text.primary}`,
          outlineOffset: -kkTokens.line.section,
        },
      })}
    >
      <Box
        ref={sticky.nameRef}
        component={motion.span}
        style={{ x: sticky.x }}
        sx={{
          justifySelf: 'start',
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'clip',
          textOverflow: 'ellipsis',
          verticalAlign: 'middle',
          willChange: 'transform',
        }}
      >
        {part.label}
      </Box>
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
          bottom: waveBottom,
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

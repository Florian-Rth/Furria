import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';
import { percentOf } from '../lane-geometry';

export type KkLaneTrackBlockTone = 'part' | 'step' | 'video';

const INSET = '0.1875rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const tonePaints: Record<KkLaneTrackBlockTone, (theme: Theme) => CSSObject> = {
  part: (theme) => ({
    backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 9%, transparent)`,
    color: palette(theme).text.primary,
  }),
  step: (theme) => ({
    backgroundColor: palette(theme).background.default,
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
  }),
  video: (theme) => ({
    backgroundColor: `color-mix(in srgb, ${palette(theme).info.main} 16%, ${palette(theme).background.paper})`,
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px color-mix(in srgb, ${palette(theme).info.main} 45%, transparent)`,
  }),
};

interface KkLaneTrackBlockProps {
  start: number;
  end: number;
  lead: string | null;
  title: string;
  meta: string | null;
  tone: KkLaneTrackBlockTone;
  selected: boolean;
  current: boolean;
  label: string;
  onPress: () => void;
  onGrab?: (share: KkStudioShare) => void;
  onDrag?: (share: KkStudioShare) => void;
  onDrop?: (moved: boolean) => void;
}

export const KkLaneTrackBlock: FC<KkLaneTrackBlockProps> = ({
  start,
  end,
  lead,
  title,
  meta,
  tone,
  selected,
  current,
  label,
  onPress,
  onGrab,
  onDrag,
  onDrop,
}) => {
  const draggable = onGrab !== undefined;
  const drag = useStudioDrag({ onPress: onGrab, onMove: onDrag, onEnd: onDrop });
  const handlers = draggable ? drag : {};
  const place = { left: percentOf(start), width: percentOf(Math.max(0, end - start)) };
  const number =
    lead === null ? null : (
      <Typography
        component="span"
        variant="h4"
        sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'inherit', flexShrink: 0 }}
      >
        {lead}
      </Typography>
    );
  const aside =
    meta === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
          opacity: 0.7,
          flexShrink: 0,
          '@container (max-width: 7.5rem)': { display: 'none' },
        }}
      >
        {meta}
      </Typography>
    );

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={selected}
      aria-current={current ? 'step' : undefined}
      onClick={onPress}
      data-kk-lane-block={tone}
      data-selected={selected}
      {...handlers}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: INSET,
        bottom: INSET,
        minWidth: 0,
        justifyContent: 'flex-start',
        gap: 0.75,
        px: 0.75,
        overflow: 'clip',
        containerType: 'inline-size',
        borderRadius: `${kkTokens.radius.bar}px`,
        cursor: draggable ? 'grab' : 'pointer',
        touchAction: draggable ? 'none' : 'auto',
        ...tonePaints[tone](theme),
        '&[data-selected="true"]': {
          backgroundColor: palette(theme).text.primary,
          color: palette(theme).background.paper,
          boxShadow: 'none',
        },
        '&::before': current
          ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: kkTokens.line.page,
              backgroundColor: palette(theme).primary.main,
            }
          : {},
        ...focusRing(theme),
        '&:focus-visible': { outlineOffset: -2, zIndex: 2 },
      })}
    >
      {number}
      <Box
        component="span"
        sx={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {title}
      </Box>
      {aside}
    </ButtonBase>
  );
};

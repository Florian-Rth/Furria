import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkFocusRing } from '../../../internal/ink-focus-ring';
import type { KkLaneGlyphName } from '../../../KkLaneGlyph';
import { KkLaneGlyph } from '../../../KkLaneGlyph';
import { kkTokens } from '../../../tokens';

const SEGMENT_ROUNDING = 0.7;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkJobSwitchSegmentProps {
  text: string;
  glyph: KkLaneGlyphName;
  current: boolean;
  onChoose: () => void;
}

export const KkJobSwitchSegment: FC<KkJobSwitchSegmentProps> = ({
  text,
  glyph,
  current,
  onChoose,
}) => (
  <ButtonBase
    role="radio"
    aria-checked={current}
    onClick={onChoose}
    data-kk-job-switch-segment={current}
    sx={(theme) => ({
      flex: '1 1 0',
      minWidth: 0,
      minHeight: kkTokens.tapTarget,
      flexDirection: 'column',
      gap: 0.25,
      py: 0.5,
      px: 0.25,
      borderRadius: `${kkTokens.radius.base * SEGMENT_ROUNDING}px`,
      color: palette(theme).text.secondary,
      transition: 'background-color 160ms ease-out, color 160ms ease-out',
      '&:hover': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
      },
      '&[data-kk-job-switch-segment="true"]': {
        color: palette(theme).background.paper,
        backgroundColor: palette(theme).text.primary,
      },
      ...inkFocusRing(theme),
    })}
  >
    <KkLaneGlyph name={glyph} />
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={{ maxWidth: '100%', fontWeight: 800, lineHeight: 1.1, color: 'inherit' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);

import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { ejFocusRing } from '../../../internal/ej-focus-ring';
import type { KkEjGlyphName } from '../../../KkEjGlyph';
import { KkEjGlyph } from '../../../KkEjGlyph';
import { kkTokens } from '../../../tokens';

const SEGMENT_ROUNDING = 0.7;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEjJobsSegmentProps {
  text: string;
  glyph: KkEjGlyphName;
  current: boolean;
  onChoose: () => void;
}

export const KkEjJobsSegment: FC<KkEjJobsSegmentProps> = ({ text, glyph, current, onChoose }) => (
  <ButtonBase
    role="radio"
    aria-checked={current}
    onClick={onChoose}
    data-kk-ej-job={current}
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
      '&[data-kk-ej-job="true"]': {
        color: palette(theme).background.paper,
        backgroundColor: palette(theme).text.primary,
      },
      ...ejFocusRing(theme),
    })}
  >
    <KkEjGlyph name={glyph} />
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

import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStageInkFrontProps {
  text: string;
}

export const KkStageInkFront: FC<KkStageInkFrontProps> = ({ text }) => (
  <Typography
    aria-hidden
    variant="overline"
    data-kk-stage-front-label
    sx={(theme) => ({
      display: 'block',
      px: 0.75,
      borderRadius: `${kkTokens.radius.pill}px`,
      fontWeight: kkTokens.eyebrow.fontWeight,
      letterSpacing: kkTokens.eyebrow.letterSpacing,
      lineHeight: 1.6,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      color: palette(theme).text.secondary,
      backgroundColor: `color-mix(in srgb, ${palette(theme).background.default} 70%, transparent)`,
    })}
  >
    {text}
  </Typography>
);

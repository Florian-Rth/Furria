import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';

export type TuschTitleTone = 'print' | 'flash' | 'ink';

const tonePaint = (tone: TuschTitleTone, theme: Theme): CSSObject => {
  if (tone === 'flash') {
    return { color: 'primary.main' };
  }

  if (tone === 'ink') {
    return {
      color: kkTokens.color.light.ink,
      ...theme.applyStyles('dark', { color: kkTokens.color.dark.gold }),
    };
  }

  return { color: 'text.primary' };
};

interface TuschTitleTextProps extends PropsWithChildren {
  tone: TuschTitleTone;
}

export const TuschTitleText: FC<TuschTitleTextProps> = ({ tone, children }) => (
  <Typography
    component="span"
    aria-hidden={tone !== 'print'}
    data-tusch-title={tone}
    sx={(theme) => ({
      typography: 'h4',
      letterSpacing: kkTokens.type.tracking.display,
      lineHeight: 1.2,
      textTransform: 'uppercase',
      ...lineClamp(1),
      ...tonePaint(tone, theme),
    })}
  >
    {children}
  </Typography>
);

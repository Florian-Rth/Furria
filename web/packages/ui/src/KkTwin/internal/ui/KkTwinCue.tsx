import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

export type KkTwinCueTone = 'still' | 'soon' | 'now';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const cuePaints: Record<KkTwinCueTone, (theme: Theme) => CSSObject> = {
  still: (theme) => ({
    color: palette(theme).text.secondary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
  }),
  soon: (theme) => ({
    ...redInk(theme),
    backgroundColor: palette(theme).background.paper,
    boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
  }),
  now: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
  }),
};

interface KkTwinCueProps {
  tone: KkTwinCueTone;
  text: string | null;
}

export const KkTwinCue: FC<KkTwinCueProps> = ({ tone, text }) => {
  const shown = text !== null;

  return (
    <Box
      aria-hidden
      data-kk-twin-cue={tone}
      sx={(theme) => ({
        display: 'grid',
        placeItems: 'center',
        minWidth: '5.25rem',
        height: '1.75rem',
        px: 1.25,
        borderRadius: `${kkTokens.radius.pill}px`,
        visibility: shown ? 'visible' : 'hidden',
        ...cuePaints[tone](theme),
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontWeight: 900,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

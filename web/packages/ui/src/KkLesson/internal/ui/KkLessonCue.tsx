import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { LESSON_CRAMPED } from '../lesson-query';

export type KkLessonCueTone = 'soon' | 'now';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const tonePaints: Record<KkLessonCueTone, (theme: Theme) => CSSObject> = {
  soon: (theme) => ({
    ...redInk(theme),
    backgroundColor: 'transparent',
    boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
  }),
  now: (theme) => ({
    color: palette(theme).primary.contrastText,
    backgroundColor: palette(theme).primary.main,
    boxShadow: 'none',
  }),
};

interface KkLessonCueProps {
  text: string | null;
  tone: KkLessonCueTone;
  label: string;
}

export const KkLessonCue: FC<KkLessonCueProps> = ({ text, tone, label }) => {
  const shown = text !== null;

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-lesson-cue={tone}
      sx={{
        flexShrink: 0,
        width: '4.25rem',
        [LESSON_CRAMPED]: { width: '3.25rem' },
        height: '2.25rem',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        aria-hidden
        data-shown={shown}
        sx={(theme) => ({
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          borderRadius: `${kkTokens.radius.pill}px`,
          opacity: 0,
          transform: 'scale(0.9)',
          transition:
            'opacity 160ms ease-out, transform 160ms ease-out, background-color 160ms ease-out',
          '&[data-shown="true"]': { opacity: 1, transform: 'none' },
          ...tonePaints[tone](theme),
        })}
      >
        <Typography component="span" variant="h3" sx={{ lineHeight: 1, color: 'inherit' }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

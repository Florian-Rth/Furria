import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';
import { nameLettersOf } from '../logic/name-letters';
import { useWidthFit } from '../logic/use-width-fit';
import { useWelcomeRun } from '../logic/welcome-run-context';
import { plateLiftOf, plateRunOf } from '../welcome-paint';

const FIT = { least: 0.4, most: 2.6 };
const SCREEN_SHARE = 0.2;
const WHISPER = '0.035em 0.035em 0';

const whisperOf = (theme: Theme): CSSObject => ({
  textShadow: `${WHISPER} ${kkTokens.color.light.ink}`,
  ...theme.applyStyles('dark', { textShadow: `${WHISPER} ${kkTokens.color.dark.gold}` }),
});

interface KkWelcomeStageNameProps {
  name: string;
  at: number;
  staggerMs: number;
}

export const KkWelcomeStageName: FC<KkWelcomeStageNameProps> = ({ name, at, staggerMs }) => {
  const { leaving } = useWelcomeRun();
  const fit = useWidthFit(FIT, SCREEN_SHARE);
  const letters = nameLettersOf(name, at, staggerMs).map((letter) => (
    <Box
      key={letter.key}
      component="span"
      sx={{ display: 'inline-block', ...plateRunOf('red', letter.delayMs, false) }}
    >
      {letter.glyph}
    </Box>
  ));

  return (
    <Box ref={fit.room} sx={{ width: '100%', flexShrink: 0, ...plateLiftOf('red', leaving) }}>
      <Typography
        ref={fit.face}
        component="h1"
        variant="poster"
        sx={[
          {
            display: 'inline-block',
            transformOrigin: 'left top',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            color: 'primary.main',
          },
          whisperOf,
        ]}
      >
        <KkVisuallyHidden>{name}</KkVisuallyHidden>
        <Box component="span" aria-hidden>
          {letters}
        </Box>
      </Typography>
    </Box>
  );
};

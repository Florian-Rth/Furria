import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNote } from '../../../KkNote';
import { kkTokens } from '../../../tokens';

interface KkAppShellGreetingProps {
  greeting: string;
  date: string;
}

export const KkAppShellGreeting: FC<KkAppShellGreetingProps> = ({ greeting, date }) => (
  <Stack data-kk-app-shell-greeting sx={{ gap: { xs: 1, desktop: 1.5 }, minWidth: 0 }}>
    <Typography
      component="p"
      sx={{
        fontFamily: kkTokens.font.display,
        fontSize: { xs: '2.0625rem', desktop: '2.875rem' },
        lineHeight: 1,
        letterSpacing: kkTokens.type.tracking.tight,
        color: 'text.primary',
      }}
    >
      {greeting}
    </Typography>
    <KkNote>{date}</KkNote>
  </Stack>
);

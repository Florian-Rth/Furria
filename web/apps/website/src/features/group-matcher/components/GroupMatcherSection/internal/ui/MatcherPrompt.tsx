import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface MatcherPromptProps {
  prompt: string;
}

export const MatcherPrompt: FC<MatcherPromptProps> = ({ prompt }) => (
  <Typography
    component="p"
    sx={{
      typography: { xs: 'h3', md: 'h2' },
      fontFamily: kkTokens.font.body,
      fontWeight: 700,
      letterSpacing: 'normal',
      lineHeight: 1.3,
    }}
  >
    {prompt}
  </Typography>
);

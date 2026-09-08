import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

type KkAppShellWordmarkPlacement = 'rail' | 'stage';

interface KkAppShellWordmarkProps {
  placement: KkAppShellWordmarkPlacement;
}

const WORDMARK = 'FURRIA';

const placements: Record<KkAppShellWordmarkPlacement, { fontSize: string; letterSpacing: string }> =
  {
    rail: { fontSize: '1.625rem', letterSpacing: '0.05em' },
    stage: { fontSize: '1.0625rem', letterSpacing: '0.07em' },
  };

export const KkAppShellWordmark: FC<KkAppShellWordmarkProps> = ({ placement }) => (
  <Typography
    component="p"
    data-kk-app-shell-wordmark
    sx={{
      fontFamily: kkTokens.font.display,
      lineHeight: 0.9,
      color: 'text.primary',
      ...placements[placement],
    }}
  >
    {WORDMARK}
  </Typography>
);

import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { filmOf } from '../../../internal/film-paint';
import { kkTokens } from '../../../tokens';

const develop = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.8; }
`;

interface KkViewerLatentProps {
  label: string;
}

export const KkViewerLatent: FC<KkViewerLatentProps> = ({ label }) => (
  <Stack
    role="img"
    aria-label={label}
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: filmOf(theme).latent,
      backgroundImage: `radial-gradient(ellipse at 50% 46%, ${filmOf(theme).edge} 0%, ${filmOf(theme).base} 72%)`,
    })}
  >
    <Typography
      component="span"
      aria-hidden
      sx={(theme) => ({
        ...theme.typography.h3,
        fontFamily: kkTokens.font.display,
        letterSpacing: kkTokens.type.tracking.display,
        color: 'warning.main',
        animation: `${develop} 2.4s ease-in-out infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.7 },
      })}
    >
      {label}
    </Typography>
  </Stack>
);

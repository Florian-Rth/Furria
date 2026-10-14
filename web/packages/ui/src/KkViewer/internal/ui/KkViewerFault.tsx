import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { filmOf } from '../../../internal/film-paint';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

interface KkViewerFaultProps {
  label: string;
}

export const KkViewerFault: FC<KkViewerFaultProps> = ({ label }) => (
  <Stack
    role="img"
    aria-label={label}
    data-kk-viewer-fault
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      alignItems: 'center',
      justifyContent: 'center',
      rowGap: 1,
      color: 'error.main',
      backgroundColor: filmOf(theme).latent,
      backgroundImage: `radial-gradient(ellipse at 50% 46%, ${filmOf(theme).edge} 0%, ${filmOf(theme).base} 72%)`,
    })}
  >
    <KkIcon name="brokenImage" size="large" />
    <Typography
      component="span"
      aria-hidden
      sx={(theme) => ({
        ...theme.typography.h3,
        fontFamily: kkTokens.font.display,
        letterSpacing: kkTokens.type.tracking.display,
      })}
    >
      {label}
    </Typography>
  </Stack>
);

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

interface KkPhotoPlaceholderProps {
  label: string;
  tint?: string;
  aspectRatio?: string;
  fill?: boolean;
}

export const KkPhotoPlaceholder: FC<KkPhotoPlaceholderProps> = ({
  label,
  tint,
  aspectRatio = '4 / 5',
  fill = false,
}) => (
  <Stack
    sx={(theme) => {
      const tintColor = tint ?? (theme.vars ?? theme).palette.primary.main;
      return {
        width: '100%',
        ...(fill ? { height: '100%' } : { aspectRatio }),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fill ? 0 : `${kkTokens.radius.base}px`,
        background: `repeating-linear-gradient(135deg, color-mix(in srgb, ${tintColor} 15%, transparent) 0 11px, color-mix(in srgb, ${tintColor} 6%, transparent) 11px 22px), ${kkTokens.photo.placeholderSurface}`,
      };
    }}
  >
    <Typography
      component="span"
      sx={(theme) => ({
        fontFamily: 'ui-monospace, monospace',
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        color: tint ?? (theme.vars ?? theme).palette.primary.main,
        bgcolor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} 80%, transparent)`,
        px: 1,
        py: 0.5,
        borderRadius: 1,
      })}
    >
      {label}
    </Typography>
  </Stack>
);

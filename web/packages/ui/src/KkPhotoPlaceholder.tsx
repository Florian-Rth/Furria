import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneRecipes } from './internal/group-tone';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import { kkTokens } from './tokens';

const TINT_PROPERTY = '--kk-photo-tint';
const TINT = `var(${TINT_PROPERTY})`;

const placeholderSurface = schemeFill(
  kkTokens.photo.placeholderSurface,
  kkTokens.photo.placeholderSurfaceDark,
);

const groupToneTint = (tone: KkGroupTone): KkScheme => ({
  light: { [TINT_PROPERTY]: groupToneRecipes[tone].inkLight },
  dark: { [TINT_PROPERTY]: groupToneRecipes[tone].inkDark },
});

const tintedSurface = (theme: Theme, tint?: string, tone?: KkGroupTone): CSSObject =>
  tone === undefined
    ? {
        [TINT_PROPERTY]: tint ?? (theme.vars ?? theme).palette.primary.main,
        ...applyScheme(theme, placeholderSurface),
      }
    : applyScheme(theme, placeholderSurface, groupToneTint(tone));

interface KkPhotoPlaceholderProps {
  label: string;
  tint?: string;
  tone?: KkGroupTone;
  aspectRatio?: string;
  fill?: boolean;
}

export const KkPhotoPlaceholder: FC<KkPhotoPlaceholderProps> = ({
  label,
  tint,
  tone,
  aspectRatio = '4 / 5',
  fill = false,
}) => (
  <Stack
    sx={(theme) => ({
      width: '100%',
      ...(fill ? { height: '100%' } : { aspectRatio }),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: fill ? 0 : `${kkTokens.radius.base}px`,
      backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${TINT} 15%, transparent) 0 11px, color-mix(in srgb, ${TINT} 6%, transparent) 11px 22px)`,
      ...tintedSurface(theme, tint, tone),
    })}
  >
    <Typography
      component="span"
      sx={(theme) => ({
        ...theme.typography.caption,
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.display,
        color: TINT,
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

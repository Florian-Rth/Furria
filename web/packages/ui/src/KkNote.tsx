import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { applyScheme, schemeInk } from './internal/scheme-paint';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkNoteTone = 'muted' | 'hint' | 'info' | 'warning';

interface KkNoteToneStyle {
  paint: (theme: Theme) => CSSObject;
  iconPaint?: (theme: Theme) => CSSObject;
  fontWeight?: number;
}

const toneStyles: Record<KkNoteTone, KkNoteToneStyle> = {
  muted: { paint: () => ({ color: 'text.secondary' }) },
  hint: {
    paint: () => ({ color: 'text.secondary' }),
    iconPaint: (theme) =>
      applyScheme(theme, schemeInk(kkTokens.color.light.blueInk, kkTokens.color.dark.blueInk)),
  },
  info: {
    paint: (theme) =>
      applyScheme(theme, schemeInk(kkTokens.color.light.blueInk, kkTokens.color.dark.blueInk)),
    fontWeight: 700,
  },
  warning: {
    paint: (theme) =>
      applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk)),
    fontWeight: 700,
  },
};

interface KkNoteProps extends PropsWithChildren {
  tone?: KkNoteTone;
  icon?: KkIconName;
  sx?: KkSx;
}

export const KkNote: FC<KkNoteProps> = ({ tone = 'muted', icon, sx, children }) => {
  const callerSx = Array.isArray(sx) ? sx : [sx];
  const toneStyle = toneStyles[tone];
  const iconStyle = (theme: Theme): CSSObject => toneStyle.iconPaint?.(theme) ?? {};

  if (icon === undefined) {
    return (
      <Typography
        variant="body2"
        data-kk-note
        sx={[
          (theme) => ({
            ...toneStyle.paint(theme),
            fontWeight: toneStyle.fontWeight,
            maxWidth: kkTokens.measure.note,
            textWrap: 'pretty',
          }),
          ...callerSx,
        ]}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      data-kk-note
      sx={[
        (theme) => ({
          ...toneStyle.paint(theme),
          alignItems: 'flex-start',
          gap: 0.875,
          maxWidth: kkTokens.measure.note,
        }),
        ...callerSx,
      ]}
    >
      <KkIcon name={icon} size="small" sx={[iconStyle, { flexShrink: 0, mt: 0.125 }]} />
      <Typography
        variant="body2"
        sx={{
          color: 'inherit',
          fontWeight: toneStyle.fontWeight,
          textWrap: 'pretty',
          minWidth: 0,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
};

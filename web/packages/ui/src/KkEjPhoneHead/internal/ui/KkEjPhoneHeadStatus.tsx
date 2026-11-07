import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkEjGlyphName } from '../../../KkEjGlyph';
import { KkEjGlyph } from '../../../KkEjGlyph';

export type KkEjPhoneHeadStatusTone = 'quiet' | 'danger';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEjPhoneHeadStatusProps {
  text: string;
  label: string;
  glyph: KkEjGlyphName;
  tone: KkEjPhoneHeadStatusTone;
  textShown?: boolean;
}

export const KkEjPhoneHeadStatus: FC<KkEjPhoneHeadStatusProps> = ({
  text,
  label,
  glyph,
  tone,
  textShown = true,
}) => {
  const shownText = textShown ? (
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={{ fontWeight: 700, lineHeight: 1.2, color: 'inherit', minWidth: 0 }}
    >
      {text}
    </Typography>
  ) : null;

  return (
    <Stack
      direction="row"
      role="status"
      aria-label={label}
      data-kk-ej-phone-status={tone}
      sx={(theme) => ({
        flexShrink: 0,
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        color: palette(theme).text.secondary,
        '&[data-kk-ej-phone-status="danger"]': redInk(theme),
      })}
    >
      <KkEjGlyph name={glyph} />
      {shownText}
    </Stack>
  );
};

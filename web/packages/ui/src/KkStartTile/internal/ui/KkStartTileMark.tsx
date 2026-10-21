import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkAnswer } from '../../../internal/answer';
import { applyScheme } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';
import { goldInk, goldInkScheme, greenInk, owedRing } from '../tile-paint';

export type KkStartTileMarkKind = KkAnswer | 'owed';

const MAYBE_GLYPH = '?';
const MARK_HEIGHT = '1.375rem';

const markInks: Record<KkStartTileMarkKind, (theme: Theme) => CSSObject> = {
  yes: greenInk,
  maybe: goldInk,
  no: () => ({ color: 'text.disabled' }),
  owed: (theme) => applyScheme(theme, goldInkScheme),
};

const markPaintOf =
  (kind: KkStartTileMarkKind) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    width: MARK_HEIGHT,
    height: MARK_HEIGHT,
    borderRadius: `${kkTokens.radius.pill}px`,
    alignItems: 'center',
    justifyContent: 'center',
    ...markInks[kind](theme),
  });

const GLYPH_PAINT: CSSObject = { lineHeight: 1, color: 'inherit' };

interface KkStartTileMarkProps {
  kind: KkStartTileMarkKind;
  label: string;
}

export const KkStartTileMark: FC<KkStartTileMarkProps> = ({ kind, label }) => {
  const glyphs: Record<KkStartTileMarkKind, ReactNode> = {
    yes: <KkIcon name="check" size="small" />,
    maybe: (
      <Typography component="span" variant="h4" sx={GLYPH_PAINT}>
        {MAYBE_GLYPH}
      </Typography>
    ),
    no: <KkIcon name="close" size="small" />,
    owed: <Box component="span" sx={owedRing} />,
  };

  return (
    <Stack component="span" data-kk-start-tile-mark={kind} sx={markPaintOf(kind)}>
      <Stack component="span" aria-hidden>
        {glyphs[kind]}
      </Stack>
      <KkVisuallyHidden>{label}</KkVisuallyHidden>
    </Stack>
  );
};

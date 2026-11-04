import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { applyScheme, schemeInk } from '../internal/scheme-paint';
import type { KkIconName } from '../KkIcon';
import { KkIcon } from '../KkIcon';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkPourCrate } from './KkPourCrate';

export type KkPourKind = 'crate' | 'payment' | 'delivery' | 'correction' | 'enrolled' | 'ended';

const TILE = '1.75rem';
const ICON = '1rem';

const ICONS: Record<Exclude<KkPourKind, 'crate'>, KkIconName> = {
  payment: 'fees',
  delivery: 'download',
  correction: 'edit',
  enrolled: 'handshake',
  ended: 'block',
};

const kindInk = (theme: Theme, kind: KkPourKind): CSSObject => {
  if (kind === 'payment') {
    return applyScheme(
      theme,
      schemeInk(kkTokens.color.light.greenInk, kkTokens.color.dark.greenInk),
    );
  }

  if (kind === 'delivery') {
    return applyScheme(theme, schemeInk(kkTokens.color.light.blueInk, kkTokens.color.dark.blueInk));
  }

  return { color: kind === 'crate' ? 'text.primary' : 'text.secondary' };
};

const tilePaint =
  (kind: KkPourKind) =>
  (theme: Theme): CSSObject => ({
    width: TILE,
    height: TILE,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${kkTokens.radius.base / 2}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: kind === 'ended' ? 'dashed' : 'solid',
    borderColor: 'divider',
    ...kindInk(theme, kind),
  });

const markOf = (kind: KkPourKind): ReactNode =>
  kind === 'crate' ? (
    <KkPourCrate filled size="glyph" sx={{ width: ICON }} />
  ) : (
    <KkIcon name={ICONS[kind]} sx={{ width: ICON, height: ICON, color: 'inherit' }} />
  );

interface KkPourKindGlyphProps {
  kind: KkPourKind;
  sx?: KkSx;
}

export const KkPourKindGlyph: FC<KkPourKindGlyphProps> = ({ kind, sx }) => {
  const mark = markOf(kind);

  return (
    <Stack
      aria-hidden
      data-kk-pour-kind={kind}
      sx={[tilePaint(kind), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {mark}
    </Stack>
  );
};

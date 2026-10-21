import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkClubIcon } from '../../../internal/club-icon';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { redInkScheme } from '../../../internal/red-ink';
import { applyScheme } from '../../../internal/scheme-paint';
import { KkClubIconGlyph } from '../../../KkClubIconGlyph';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { useTileLanding } from '../logic/tile-context';
import { tileLandDelayMs } from '../logic/tile-land';
import {
  blueInkScheme,
  coinGroundScheme,
  goldGroundScheme,
  goldInkScheme,
  tilePop,
} from '../tile-paint';

export type KkStartTileCoinTone = 'ink' | 'gold' | 'blue' | 'red';

const COIN = '2.25rem';
const GLYPH_PAINT = { width: '1.125rem', height: '1.125rem' } as const;

const coinInks: Record<KkStartTileCoinTone, (theme: Theme) => CSSObject> = {
  ink: (theme) => ({ color: 'text.primary', ...applyScheme(theme, coinGroundScheme) }),
  gold: (theme) => applyScheme(theme, goldInkScheme, goldGroundScheme),
  blue: (theme) => applyScheme(theme, blueInkScheme, coinGroundScheme),
  red: (theme) => applyScheme(theme, redInkScheme, coinGroundScheme),
};

const POP_AFTER_LAND_MS = 240;
const POP_MS = 380;

const coinPaint =
  (tone: KkStartTileCoinTone, groupTone: KkGroupTone | undefined, delayMs: number) =>
  (theme: Theme): CSSObject => ({
    animation: `${tilePop} ${POP_MS}ms ease-out ${delayMs}ms both`,
    flexShrink: 0,
    width: COIN,
    height: COIN,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    ...(groupTone === undefined ? coinInks[tone](theme) : groupToneFieldPaint(theme, groupTone)),
  });

interface KkStartTileCoinProps {
  icon: KkIconName;
  glyph?: KkClubIcon;
  tone?: KkStartTileCoinTone;
  groupTone?: KkGroupTone;
}

export const KkStartTileCoin: FC<KkStartTileCoinProps> = ({
  icon,
  glyph,
  tone = 'ink',
  groupTone,
}) => {
  const { order } = useTileLanding();
  const delayMs = tileLandDelayMs(order) + POP_AFTER_LAND_MS;
  const face =
    glyph === undefined ? (
      <KkIcon name={icon} size="small" />
    ) : (
      <KkClubIconGlyph icon={glyph} sx={GLYPH_PAINT} />
    );

  return (
    <Stack
      component="span"
      aria-hidden
      data-kk-start-tile-coin
      sx={coinPaint(tone, groupTone, delayMs)}
    >
      {face}
    </Stack>
  );
};

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { FlapGlyphTone } from '../../../internal/flap/FlapGlyph';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { useEyebrowFlip } from '../logic/use-eyebrow-flip';
import { KkDensePanelEyebrowCell } from './KkDensePanelEyebrowCell';

export type KkStampTone = 'plain' | 'live' | 'today';

const LIVE_DOT_SIZE = '0.375rem';

const glyphTones: Record<KkStampTone, FlapGlyphTone> = {
  plain: 'muted',
  live: 'accent',
  today: 'accent',
};

const EYEBROW_FRAME: CSSObject = {
  typography: 'caption',
  minHeight: '1lh',
  alignItems: 'center',
  gap: 0.5,
  minWidth: 0,
  whiteSpace: 'pre',
};

const LETTERS: CSSObject = { minWidth: 0 };

const liveDotPaint = (theme: Theme): CSSObject => ({
  display: 'inline-block',
  width: LIVE_DOT_SIZE,
  height: LIVE_DOT_SIZE,
  flexShrink: 0,
  borderRadius: '50%',
  ...redInk(theme),
  backgroundColor: 'currentColor',
  animation: kkTokens.motion.breath,
});

interface KkDensePanelStampEyebrowProps {
  text: string;
  tone: KkStampTone;
  live: boolean;
}

export const KkDensePanelStampEyebrow: FC<KkDensePanelStampEyebrowProps> = ({
  text,
  tone,
  live,
}) => {
  const flip = useEyebrowFlip(text);
  const glyphTone = glyphTones[tone];
  const emptyMark = text.length === 0 ? '' : undefined;
  const liveDot = live ? <Box component="span" data-kk-dense-live sx={liveDotPaint} /> : null;
  const cells = flip.cells.map((cell) => (
    <KkDensePanelEyebrowCell
      key={cell.slot}
      cell={cell}
      tone={glyphTone}
      progress={flip.progress}
    />
  ));

  return (
    <Stack direction="row" data-kk-dense-eyebrow data-empty={emptyMark} sx={EYEBROW_FRAME}>
      {liveDot}
      <Stack component="span" direction="row" sx={LETTERS}>
        {cells}
      </Stack>
    </Stack>
  );
};

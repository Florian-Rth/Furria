import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkPracticeGlyph } from './kk-practice-glyphs';
import { KK_PRACTICE_GLYPHS } from './kk-practice-glyphs';

export interface KkPracticeScreenHintLine {
  key: string;
  glyph: KkPracticeGlyph;
  text: string;
}

interface KkPracticeScreenHintProps {
  lines: readonly KkPracticeScreenHintLine[];
  shown: boolean;
}

export const KkPracticeScreenHint: FC<KkPracticeScreenHintProps> = ({ lines, shown }) => {
  const rows = lines.map((line) => (
    <Stack key={line.key} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <Typography component="span" variant="body1" sx={{ display: 'flex', opacity: 0.8 }}>
        {KK_PRACTICE_GLYPHS[line.glyph]}
      </Typography>
      <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>
        {line.text}
      </Typography>
    </Stack>
  ));

  return (
    <Stack
      aria-hidden={!shown}
      data-kk-practice-hint
      data-shown={shown}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        justifyContent: 'flex-end',
        gap: 0.5,
        p: { xs: 1.5, desktop: 2.5 },
        borderRadius: 'inherit',
        backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${kkTokens.overlay.scrimInk} 72%, transparent), transparent 60%)`,
        color: kkTokens.overlay.onPhotoText,
        textShadow: kkTokens.overlay.textShadow,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 320ms ease-out',
        '&[data-shown="true"]': { opacity: 1 },
      }}
    >
      {rows}
    </Stack>
  );
};

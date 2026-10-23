import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { inkWashSurface } from './internal/ink-wash';
import type { KkSeverity } from './KkSeverityGlyph';
import { KkSeverityGlyph } from './KkSeverityGlyph';
import { kkTokens } from './tokens';

interface KkOutcomeNoteProps {
  sentence: string;
  state: KkSeverity | null;
  stateText: string;
}

export const KkOutcomeNote: FC<KkOutcomeNoteProps> = ({ sentence, state, stateText }) => {
  const glyph = state === null ? null : <KkSeverityGlyph state={state} size="medium" />;

  return (
    <Stack
      role="status"
      data-kk-outcome-note={state ?? 'none'}
      sx={(theme) => ({
        gap: 0.5,
        px: 1.5,
        py: 1.25,
        borderRadius: `${kkTokens.radius.base}px`,
        ...inkWashSurface(theme, '4%', '8%'),
      })}
    >
      <Box
        component="span"
        sx={{ typography: 'subtitle2', fontWeight: 800, lineHeight: 1.3, color: 'text.primary' }}
      >
        {sentence}
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        {glyph}
        <Box
          component="span"
          sx={{ typography: 'caption', fontWeight: 700, color: 'text.secondary' }}
        >
          {stateText}
        </Box>
      </Stack>
    </Stack>
  );
};

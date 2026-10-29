import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../internal/red-ink';
import { kkTokens } from '../tokens';

interface KkStudioFStepSheetProps {
  number: string;
  name: string;
  part: string | null;
  description: string;
}

export const KkStudioFStepSheet: FC<KkStudioFStepSheetProps> = ({
  number,
  name,
  part,
  description,
}) => {
  const eyebrow =
    part === null ? null : (
      <Typography
        component="p"
        sx={{
          typography: 'caption',
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.eyebrow.letterSpacing,
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {part}
      </Typography>
    );

  return (
    <Stack
      data-kk-studio-f-step-sheet
      sx={{ px: 2.5, pt: 1, pb: 4, gap: 1.5, maxWidth: kkTokens.measure.text, mx: 'auto' }}
    >
      {eyebrow}
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1.25 }}>
        <Typography
          component="span"
          sx={(theme) => ({
            typography: 'h1',
            fontVariantNumeric: 'tabular-nums',
            ...redInk(theme),
          })}
        >
          {number}
        </Typography>
        <Typography component="h2" sx={{ typography: 'h1' }}>
          {name}
        </Typography>
      </Stack>
      <Typography sx={{ typography: 'body1', whiteSpace: 'pre-line' }}>{description}</Typography>
    </Stack>
  );
};

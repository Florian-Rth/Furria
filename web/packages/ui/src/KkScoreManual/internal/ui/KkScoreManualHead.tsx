import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { SCORE_FIGURES, shadeFill } from '../../../KkScoreTrack/internal/score-paint';
import { kkTokens } from '../../../tokens';

interface KkScoreManualHeadProps {
  title: string;
  meta: string;
  tone: KkGroupTone | null;
  shade: number | null;
}

export const KkScoreManualHead: FC<KkScoreManualHeadProps> = ({ title, meta, tone, shade }) => {
  const swatch =
    shade === null ? null : (
      <Box
        aria-hidden
        component="span"
        sx={(theme) => ({
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: `${kkTokens.radius.bar}px`,
          flexShrink: 0,
          ...shadeFill(theme, tone, shade),
        })}
      />
    );

  return (
    <Stack
      direction="row"
      data-kk-score-manual-head
      sx={{
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        pb: 0.5,
        mb: 0.25,
        borderBottomWidth: kkTokens.line.section,
        borderBottomStyle: 'solid',
        borderBottomColor: 'text.primary',
      }}
    >
      {swatch}
      <Box
        component="h3"
        sx={{
          m: 0,
          typography: 'caption',
          fontWeight: 900,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          color: 'text.primary',
          minWidth: 0,
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </Box>
      <Box
        component="span"
        sx={{
          ml: 'auto',
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          ...SCORE_FIGURES,
        }}
      >
        {meta}
      </Box>
    </Stack>
  );
};

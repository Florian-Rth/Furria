import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export type KkStudioAStageTagMark = 'own' | 'open' | 'front';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const swatchPaints: Record<KkStudioAStageTagMark, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '50%',
    backgroundColor: palette(theme).primary.main,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${palette(theme).primary.main} 24%, transparent)`,
  }),
  open: (theme) => ({
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: '50%',
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
  }),
  front: (theme) => ({
    width: '0.875rem',
    height: `${kkTokens.line.page}px`,
    backgroundColor: palette(theme).text.primary,
  }),
};

interface KkStudioAStageTagProps {
  text: string;
  mark: KkStudioAStageTagMark;
}

export const KkStudioAStageTag: FC<KkStudioAStageTagProps> = ({ text, mark }) => (
  <Stack
    direction="row"
    data-kk-studio-a-stage-tag={mark}
    sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}
  >
    <Box aria-hidden sx={(theme) => swatchPaints[mark](theme)} />
    <Typography
      variant="caption"
      sx={{
        fontWeight: 800,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        color: mark === 'front' ? 'text.secondary' : 'text.primary',
      }}
    >
      {text}
    </Typography>
  </Stack>
);

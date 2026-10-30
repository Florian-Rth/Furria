import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

const DOT = '0.625rem';

const bannerPaint = (theme: Theme): CSSObject => ({
  alignItems: 'baseline',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 1.5),
  borderRadius: `${kkTokens.radius.base}px`,
  backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.warning.main} 14%, transparent)`,
});

const dotPaint = (theme: Theme): CSSObject => ({
  width: DOT,
  height: DOT,
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: (theme.vars ?? theme).palette.warning.main,
});

interface KkTrainingViewNoticeProps {
  text: string;
}

export const KkTrainingViewNotice: FC<KkTrainingViewNoticeProps> = ({ text }) => (
  <Stack direction="row" role="status" sx={bannerPaint}>
    <Box component="span" aria-hidden sx={dotPaint} />
    <Typography variant="subtitle2" component="p" sx={goldInkOf}>
      {text}
    </Typography>
  </Stack>
);

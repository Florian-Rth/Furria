import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';

interface KkStudioHCountsTextProps {
  text: string;
  accent: boolean;
}

export const KkStudioHCountsText: FC<KkStudioHCountsTextProps> = ({ text, accent }) => (
  <Typography
    component="span"
    variant="caption"
    data-kk-studio-h-counts-text
    sx={(theme) => ({
      minWidth: 0,
      fontWeight: 800,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontVariantNumeric: 'tabular-nums',
      color: (theme.vars ?? theme).palette.text.secondary,
      ...(accent ? redInk(theme) : {}),
    })}
  >
    {text}
  </Typography>
);

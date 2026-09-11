import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { rowDividerBottom } from './internal/row-divider';
import { KkEyebrow } from './KkEyebrow';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';

interface KkFieldRowProps {
  label: string;
  value: ReactNode;
  hint?: string;
  sx?: KkSx;
}

export const KkFieldRow: FC<KkFieldRowProps> = ({ label, value, hint, sx }) => {
  const hintLine = hint === undefined ? null : <KkMeta sx={{ textAlign: 'right' }}>{hint}</KkMeta>;

  return (
    <Stack
      direction="row"
      data-kk-field-row
      sx={[
        {
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 2,
          minWidth: 0,
          py: 1.5,
          ...rowDividerBottom,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkEyebrow tone="muted">{label}</KkEyebrow>
      <Stack sx={{ minWidth: 0, alignItems: 'flex-end', gap: 0.25 }}>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: 800, textAlign: 'right', minWidth: 0, color: 'text.primary' }}
        >
          {value}
        </Typography>
        {hintLine}
      </Stack>
    </Stack>
  );
};

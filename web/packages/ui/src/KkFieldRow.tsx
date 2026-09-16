import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { rowDividerBottom } from './internal/row-divider';
import { KkEyebrow } from './KkEyebrow';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';

const ROW_DIRECTION = { xs: 'column', desktop: 'row' } as const;
const VALUE_ALIGN = { xs: 'left', desktop: 'right' } as const;
const HINT_ALIGN = { textAlign: VALUE_ALIGN } as const;

interface KkFieldRowProps {
  label: string;
  value: ReactNode;
  hint?: string;
  sx?: KkSx;
}

export const KkFieldRow: FC<KkFieldRowProps> = ({ label, value, hint, sx }) => {
  const hintLine = hint === undefined ? null : <KkMeta sx={HINT_ALIGN}>{hint}</KkMeta>;

  return (
    <Stack
      direction={ROW_DIRECTION}
      data-kk-field-row
      sx={[
        {
          alignItems: { xs: 'flex-start', desktop: 'baseline' },
          justifyContent: 'space-between',
          gap: { xs: 0.375, desktop: 2 },
          minWidth: 0,
          py: 1.5,
          ...rowDividerBottom,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkEyebrow tone="muted">{label}</KkEyebrow>
      <Stack
        sx={{
          minWidth: 0,
          maxWidth: '100%',
          alignItems: { xs: 'flex-start', desktop: 'flex-end' },
          gap: 0.25,
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: 800, textAlign: VALUE_ALIGN, minWidth: 0, color: 'text.primary' }}
        >
          {value}
        </Typography>
        {hintLine}
      </Stack>
    </Stack>
  );
};

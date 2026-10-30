import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioIDetailFactProps {
  label: string;
  value: string;
  tone?: 'plain' | 'changed';
}

export const KkStudioIDetailFact: FC<KkStudioIDetailFactProps> = ({
  label,
  value,
  tone = 'plain',
}) => (
  <Stack
    direction="row"
    sx={(theme) => ({
      alignItems: 'baseline',
      gap: 1.5,
      py: 0.375,
      borderBottom: `1px solid ${(theme.vars ?? theme).palette.divider}`,
      '&:last-of-type': { borderBottom: 'none' },
    })}
  >
    <Typography
      component="dt"
      variant="caption"
      sx={{ width: '6.5rem', flexShrink: 0, color: 'text.secondary', fontWeight: 600 }}
    >
      {label}
    </Typography>
    <Typography
      component="dd"
      variant="body2"
      data-tone={tone}
      sx={{
        m: 0,
        flex: 1,
        minWidth: 0,
        fontWeight: tone === 'changed' ? 800 : 600,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </Typography>
  </Stack>
);

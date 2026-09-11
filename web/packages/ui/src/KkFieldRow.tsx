import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { KkEyebrow } from './KkEyebrow';
import { kkTokens } from './tokens';

interface KkFieldRowProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export const KkFieldRow: FC<KkFieldRowProps> = ({ label, value, hint }) => {
  const hintLine =
    hint === undefined ? null : (
      <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'right' }}>
        {hint}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-field-row
      sx={{
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 2,
        minWidth: 0,
        py: 1.5,
        borderBottom: kkTokens.line.hair,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
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

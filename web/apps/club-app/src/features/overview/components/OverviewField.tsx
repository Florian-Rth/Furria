import { KkEyebrow, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface OverviewFieldProps {
  label: string;
  value: string;
}

export const OverviewField: FC<OverviewFieldProps> = ({ label, value }) => (
  <Stack sx={{ gap: 0.25, minWidth: 0 }}>
    <KkEyebrow tone="muted">{label}</KkEyebrow>
    <KkText variant="body2">{value}</KkText>
  </Stack>
);

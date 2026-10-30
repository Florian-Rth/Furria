import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioIOverviewSectionProps extends PropsWithChildren {
  label: string;
}

export const KkStudioIOverviewSection: FC<KkStudioIOverviewSectionProps> = ({
  label,
  children,
}) => (
  <Stack component="section" aria-label={label} sx={{ gap: 0.75, minWidth: 0, flexShrink: 0 }}>
    {children}
  </Stack>
);

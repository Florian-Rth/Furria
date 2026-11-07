import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkSsStepListRootProps extends PropsWithChildren {
  label: string;
}

export const KkSsStepListRoot: FC<KkSsStepListRootProps> = ({ label, children }) => (
  <Stack
    role="list"
    aria-label={label}
    data-kk-ss-step-list
    sx={{ flexShrink: 0, minWidth: 0, gap: 1 }}
  >
    {children}
  </Stack>
);

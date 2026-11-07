import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkStudioStepListRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioStepListRoot: FC<KkStudioStepListRootProps> = ({ label, children }) => (
  <Stack
    role="list"
    aria-label={label}
    data-kk-studio-step-list
    sx={{ flexShrink: 0, minWidth: 0, gap: 1 }}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkPracticeKeysRootProps extends PropsWithChildren {
  label: string;
}

export const KkPracticeKeysRoot: FC<KkPracticeKeysRootProps> = ({ label, children }) => (
  <Stack role="group" aria-label={label} data-kk-practice-keys sx={{ gap: 1, minWidth: 0 }}>
    {children}
  </Stack>
);

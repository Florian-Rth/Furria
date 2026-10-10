import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkNewsProofPanelProps extends PropsWithChildren {
  label: string;
}

export const KkNewsProofPanel: FC<KkNewsProofPanelProps> = ({ label, children }) => (
  <Stack
    component="figure"
    aria-label={label}
    data-kk-news-proof-panel
    sx={{ position: 'relative', m: 0, gap: 1, minWidth: 0 }}
  >
    {children}
  </Stack>
);

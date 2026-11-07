import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkEditorToolBarRootProps extends PropsWithChildren {
  label: string;
}

export const KkEditorToolBarRoot: FC<KkEditorToolBarRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-editor-tool-bar
    sx={{ minWidth: 0, gap: 0.5, '& > *': { flex: '1 1 0', minWidth: 0 } }}
  >
    {children}
  </Stack>
);

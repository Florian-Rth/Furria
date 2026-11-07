import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkEditorStageRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-editor-stage sx={{ minWidth: 0, minHeight: 0, height: '100%' }}>
    {children}
  </Stack>
);

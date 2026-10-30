import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_STUDIO_I_WIDE_SHORT } from '../../../KkStudioIEditor/studio-i-editor-query';

interface KkStudioIClipRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioIClipRoot: FC<KkStudioIClipRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-studio-i-clip
    sx={{
      gap: 0.75,
      minWidth: 0,
      flexShrink: 0,
      [KK_STUDIO_I_WIDE_SHORT]: { flex: 1, minHeight: 0 },
    }}
  >
    {children}
  </Stack>
);

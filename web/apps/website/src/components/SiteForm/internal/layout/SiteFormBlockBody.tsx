import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const SiteFormBlockBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-site-form-block-body
    sx={{ gap: kkTokens.layout.fieldGap, mt: kkTokens.layout.fieldGap }}
  >
    {children}
  </Stack>
);

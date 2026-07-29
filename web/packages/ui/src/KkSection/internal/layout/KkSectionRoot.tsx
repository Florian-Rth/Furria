import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkSectionRootProps extends PropsWithChildren {
  id?: string;
  sx?: SxProps<Theme>;
}

export const KkSectionRoot: FC<KkSectionRootProps> = ({ id, sx, children }) => (
  <Stack
    component="section"
    id={id}
    data-kk-section
    sx={[{ gap: kkTokens.layout.blockGap }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

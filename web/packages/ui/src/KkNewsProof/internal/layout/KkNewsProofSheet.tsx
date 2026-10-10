import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkNewsProofSheetProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkNewsProofSheet: FC<KkNewsProofSheetProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-news-imposition
    sx={[
      {
        position: 'relative',
        gap: 1.5,
        p: 2,
        minWidth: 0,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.rest,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkNamesSheetListProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkNamesSheetList: FC<KkNamesSheetListProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-names-sheet-list
    sx={[
      {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        gap: 0.25,
        m: 0,
        px: 1,
        pb: 2,
        listStyle: 'none',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

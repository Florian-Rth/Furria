import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KkProofSheetTrimMarks } from '../ui/KkProofSheetTrimMarks';

interface KkProofSheetRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkProofSheetRoot: FC<KkProofSheetRootProps> = ({ label, sx, children }) => (
  <Stack
    component="article"
    aria-label={label}
    data-kk-proof-sheet
    sx={[
      (theme) => ({
        position: 'relative',
        minWidth: 0,
        gap: { xs: 2.5, md: 3 },
        px: { xs: 2.5, sm: 3.5, md: 6 },
        py: { xs: 3, md: 4.5 },
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: theme.shadows[1],
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkProofSheetTrimMarks />
    {children}
  </Stack>
);

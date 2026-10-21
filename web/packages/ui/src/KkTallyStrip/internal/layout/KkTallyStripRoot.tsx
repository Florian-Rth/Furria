import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkTallyStripRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkTallyStripRoot: FC<KkTallyStripRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-tally-strip
    sx={[
      {
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkPlanStatusStripRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPlanStatusStripRoot: FC<KkPlanStatusStripRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    direction="row"
    aria-label={label}
    data-kk-plan-status-strip
    sx={[
      {
        minWidth: 0,
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 2,
        rowGap: 0.75,
        px: 1.5,
        py: 0.75,
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

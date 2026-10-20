import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkStepListRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStepListRoot: FC<KkStepListRootProps> = ({ label, sx, children }) => (
  <Stack
    component="nav"
    aria-label={label}
    data-kk-step-list
    sx={[
      {
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'hidden',
        '& > [data-kk-step-list-step] + [data-kk-step-list-step], & > [data-kk-step-list-step] + [data-kk-step-list-later]':
          {
            borderTopWidth: kkTokens.line.hair,
            borderTopStyle: 'solid',
            borderTopColor: 'divider',
          },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

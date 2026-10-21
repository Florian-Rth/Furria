import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkRosterRootProps extends PropsWithChildren {
  label: string;
  id?: string;
  compact?: boolean;
  sx?: KkSx;
}

export const KkRosterRoot: FC<KkRosterRootProps> = ({
  label,
  id,
  compact = false,
  sx,
  children,
}) => (
  <Stack
    component="ul"
    id={id}
    aria-label={label}
    data-kk-roster
    data-compact={compact}
    sx={[
      {
        m: 0,
        p: 0,
        listStyle: 'none',
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

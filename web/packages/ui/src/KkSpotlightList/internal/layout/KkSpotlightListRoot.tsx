import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkSpotlightListRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkSpotlightListRoot: FC<KkSpotlightListRootProps> = ({ label, sx, children }) => (
  <Box
    component="ul"
    aria-label={label}
    data-kk-spotlight-list
    sx={[
      {
        listStyle: 'none',
        m: 0,
        p: 0,
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.rest,
        '& > li + li': {
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: 'divider',
        },
        '& > li:first-of-type': {
          borderTopLeftRadius: `${kkTokens.radius.base}px`,
          borderTopRightRadius: `${kkTokens.radius.base}px`,
        },
        '& > li:last-of-type': {
          borderBottomLeftRadius: `${kkTokens.radius.base}px`,
          borderBottomRightRadius: `${kkTokens.radius.base}px`,
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);

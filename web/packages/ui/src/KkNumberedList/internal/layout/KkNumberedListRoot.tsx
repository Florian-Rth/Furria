import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkNumberedListRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkNumberedListRoot: FC<KkNumberedListRootProps> = ({ label, sx, children }) => (
  <Box
    component="ul"
    aria-label={label}
    data-kk-numbered-list
    sx={[
      {
        listStyle: 'none',
        m: 0,
        p: 0,
        minWidth: 0,
        position: 'relative',
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.rest,
        '& > [data-kk-numbered-line] + [data-kk-numbered-line]': {
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: 'divider',
        },
        '& > [data-kk-numbered-line]:first-of-type': {
          borderTopLeftRadius: `${kkTokens.radius.base}px`,
          borderTopRightRadius: `${kkTokens.radius.base}px`,
        },
        '& > [data-kk-numbered-line]:last-of-type': {
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

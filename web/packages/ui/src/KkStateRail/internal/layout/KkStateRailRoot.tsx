import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { RAIL_CONTAINER, RAIL_RISE_SECONDS, RAIL_WIDE, railRise } from '../state-rail-paint';

interface KkStateRailRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStateRailRoot: FC<KkStateRailRootProps> = ({ label, sx, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-state-rail
    sx={[
      (theme) => ({
        minWidth: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        clipPath: `inset(0 round ${kkTokens.radius.base}px)`,
        containerType: 'inline-size',
        containerName: RAIL_CONTAINER,
        ...raisedSurface(theme),
        animation: `${railRise} ${RAIL_RISE_SECONDS}s ease-out both`,
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Stack
      sx={{
        minWidth: 0,
        [RAIL_WIDE]: {
          flexDirection: 'row',
          '& > [data-kk-state-lead]': { flex: '0 0 34%' },
          '& > [data-kk-state-tiles]': {
            flex: '1 1 0',
            borderTopWidth: 0,
            borderLeftWidth: kkTokens.line.hair,
            borderLeftStyle: 'solid',
            borderLeftColor: 'divider',
          },
        },
      }}
    >
      {children}
    </Stack>
  </Box>
);

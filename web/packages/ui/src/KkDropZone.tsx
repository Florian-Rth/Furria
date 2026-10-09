import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const { gallery } = kkTokens;

interface KkDropZoneProps extends PropsWithChildren {
  active: boolean;
  roomy?: boolean;
  sx?: KkSx;
}

export const KkDropZone: FC<KkDropZoneProps> = ({ active, roomy = false, sx, children }) => (
  <Stack
    data-kk-drop-zone={active ? 'active' : 'rest'}
    sx={[
      (theme) => ({
        rowGap: 1.5,
        justifyContent: 'center',
        minHeight: roomy ? '40dvh' : 0,
        px: 1.5,
        py: roomy ? 3 : 1.5,
        borderRadius: `${kkTokens.radius.base}px`,
        border: `${kkTokens.line.section}px dashed`,
        borderColor: active
          ? (theme.vars ?? theme).palette.warning.main
          : (theme.vars ?? theme).palette.divider,
        backgroundColor: active ? gallery.darkroomEdge : 'transparent',
        color: active ? kkTokens.overlay.onPhotoText : 'inherit',
        transform: active ? 'scale(1.01)' : 'none',
        transition:
          'border-color 160ms ease-out, background-color 200ms ease-out, transform 200ms ease-out',
        '@media (prefers-reduced-motion: reduce)': { transform: 'none' },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);

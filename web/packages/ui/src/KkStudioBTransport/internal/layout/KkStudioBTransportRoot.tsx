import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const rootPaint = (theme: Theme): CSSObject => ({
  position: 'sticky',
  bottom: `calc(${kkTokens.shell.gutter}px + env(safe-area-inset-bottom, 0px))`,
  zIndex: 2,
  gap: theme.spacing(1),
  minWidth: 0,
  px: 1.25,
  py: 1,
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  backgroundColor: (theme.vars ?? theme).palette.background.paper,
  boxShadow: kkTokens.shadow.floating,
});

interface KkStudioBTransportRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkStudioBTransportRoot: FC<KkStudioBTransportRootProps> = ({
  label,
  sx,
  children,
}) => (
  <Stack
    role="toolbar"
    aria-label={label}
    data-kk-studio-b-transport
    sx={[rootPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);

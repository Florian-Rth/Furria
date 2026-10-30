import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { KK_STUDIO_I_WIDE } from '../../../KkStudioIEditor/studio-i-editor-query';
import { kkTokens } from '../../../tokens';

interface KkStudioIRailRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioIRailRoot: FC<KkStudioIRailRootProps> = ({ label, children }) => (
  <Stack
    component="nav"
    direction="row"
    aria-label={label}
    data-kk-studio-i-rail
    sx={(theme) => ({
      minWidth: 0,
      minHeight: 0,
      gap: 1.5,
      overflowX: 'auto',
      overflowY: 'clip',
      overscrollBehavior: 'contain',
      scrollbarWidth: 'none',
      px: trackEdgeOf('left'),
      scrollPaddingInline: trackEdgeOf('left'),
      [KK_STUDIO_I_WIDE]: {
        flexDirection: 'column',
        overflowX: 'clip',
        overflowY: 'auto',
        gap: 2,
        px: 1,
        py: 1.5,
        scrollPaddingBlock: '1rem',
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
        scrollbarWidth: 'thin',
      },
    })}
  >
    {children}
  </Stack>
);

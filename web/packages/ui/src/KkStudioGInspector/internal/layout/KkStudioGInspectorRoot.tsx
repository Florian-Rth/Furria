import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';
import { kkTokens } from '../../../tokens';

interface KkStudioGInspectorRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioGInspectorRoot: FC<KkStudioGInspectorRootProps> = ({ label, children }) => (
  <Box
    component="aside"
    aria-label={label}
    data-kk-studio-g-inspector
    sx={(theme) => ({
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      overflow: 'clip',
      [STUDIO_G_WIDE]: {
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      },
    })}
  >
    {children}
  </Box>
);

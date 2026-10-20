import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';

const FOOT_BOTTOM = 12;

export const KkStepPaneFoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-step-pane-foot
    sx={{
      position: 'sticky',
      bottom: 0,
      zIndex: 1,
      gap: 1,
      minWidth: 0,
      pt: 1.5,
      pb: safeArea('bottom', FOOT_BOTTOM),
      bgcolor: 'background.paper',
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
    }}
  >
    {children}
  </Stack>
);

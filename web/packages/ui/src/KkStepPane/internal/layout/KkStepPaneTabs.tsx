import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStepPaneTabsProps extends PropsWithChildren {
  label: string;
}

export const KkStepPaneTabs: FC<KkStepPaneTabsProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="tablist"
    aria-label={label}
    data-kk-step-pane-tabs
    sx={{
      alignItems: 'stretch',
      justifyContent: 'space-between',
      minWidth: 0,
      borderBottomWidth: kkTokens.line.hair,
      borderBottomStyle: 'solid',
      borderBottomColor: 'divider',
    }}
  >
    {children}
  </Stack>
);

import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { planRaisedSurface } from '../../../internal/plan-surface';

interface KkPlanActionBarRootProps extends PropsWithChildren {
  label: string;
}

export const KkPlanActionBarRoot: FC<KkPlanActionBarRootProps> = ({ label, children }) => (
  <Stack
    role="toolbar"
    aria-label={label}
    direction="row"
    data-kk-plan-action-bar
    sx={(theme) => ({
      ...planRaisedSurface(theme),
      alignItems: 'center',
      gap: 0.25,
      p: 0.5,
      flexWrap: 'wrap',
      justifyContent: 'center',
      maxWidth: '100%',
    })}
  >
    {children}
  </Stack>
);

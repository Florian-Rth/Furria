import { KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';

const DESKTOP_ONLY_ACTION = { xs: 'none', desktop: 'flex' };

interface AppListSectionHeadProps {
  title: string;
  action?: ReactNode;
}

export const AppListSectionHead: FC<AppListSectionHeadProps> = ({ title, action }) => {
  const desktopAction =
    action === undefined ? undefined : (
      <Stack sx={{ display: DESKTOP_ONLY_ACTION, flexShrink: 0 }}>{action}</Stack>
    );

  return <KkPanelHeader title={title} action={desktopAction} />;
};

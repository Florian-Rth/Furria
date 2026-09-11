import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useNavGroups } from '../hooks/use-nav-groups';
import { AppNavGroup } from './AppNavGroup';

export const AppNav: FC = () => {
  const groups = useNavGroups();
  const renderedGroups = groups.map((group) => <AppNavGroup key={group.id} group={group} />);

  return (
    <Stack
      sx={{
        flex: 1,
        minWidth: 0,
        gap: 2.5,
        justifyContent: { xs: 'center', desktop: 'flex-start' },
      }}
    >
      {renderedGroups}
    </Stack>
  );
};

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNote } from '../../../KkNote';

interface KkAppShellPageHeaderProps {
  title: string;
  sub?: string;
}

export const KkAppShellPageHeader: FC<KkAppShellPageHeaderProps> = ({ title, sub }) => {
  const subLine = sub === undefined ? null : <KkNote>{sub}</KkNote>;

  return (
    <Stack
      data-kk-app-shell-page-header
      sx={{
        gap: 0.75,
        pb: 2,
        borderBottom: 1.5,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {subLine}
    </Stack>
  );
};

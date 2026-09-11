import { KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface MemberSectionProps extends PropsWithChildren {
  title: string;
}

export const MemberSection: FC<MemberSectionProps> = ({ title, children }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <KkPanelHeader title={title} />
    {children}
  </Stack>
);

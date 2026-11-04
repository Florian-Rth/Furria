import { KkTabStage } from '@furria/ui/KkTabStage';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface BeerBookStatusProps extends PropsWithChildren {
  head: ReactNode;
}

export const BeerBookStatus: FC<BeerBookStatusProps> = ({ head, children }) => (
  <>
    <KkTabStage.Top>{head}</KkTabStage.Top>
    <KkTabStage.Middle>
      <Stack sx={{ alignSelf: 'stretch', minWidth: 0 }}>{children}</Stack>
    </KkTabStage.Middle>
  </>
);

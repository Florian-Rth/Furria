import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkBottomDrawer } from '../../../KkBottomDrawer/KkBottomDrawer';

const SHEET_MIN_HEIGHT = '50dvh';

interface KkNamesSheetRootProps extends PropsWithChildren {
  open: boolean;
  label: string;
  closeLabel: string;
  onClose: () => void;
}

export const KkNamesSheetRoot: FC<KkNamesSheetRootProps> = ({
  open,
  label,
  closeLabel,
  onClose,
  children,
}) => (
  <KkBottomDrawer open={open} label={label} closeLabel={closeLabel} onClose={onClose}>
    <Stack data-kk-names-sheet sx={{ minHeight: SHEET_MIN_HEIGHT, flex: 1, minWidth: 0 }}>
      {children}
    </Stack>
  </KkBottomDrawer>
);

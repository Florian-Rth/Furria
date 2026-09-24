import Stack from '@mui/material/Stack';
import type { FC, Ref } from 'react';

interface KkShellActionSlotProps {
  ref?: Ref<HTMLDivElement>;
}

export const KkShellActionSlot: FC<KkShellActionSlotProps> = ({ ref }) => (
  <Stack ref={ref} data-kk-shell-action-slot sx={{ minWidth: 0, '&:empty': { display: 'none' } }} />
);

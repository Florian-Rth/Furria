import { KkSkeletonText } from '@furria/ui/KkSkeletonText';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CHECKING_LINE } from '../upload-link-copy';

export const LinkUploadChecking: FC = () => (
  <Stack role="status" sx={{ gap: 1.5, minWidth: 0 }}>
    <KkVisuallyHidden>{CHECKING_LINE}</KkVisuallyHidden>
    <KkSkeletonText width="70%" />
    <KkSkeletonText width="45%" />
  </Stack>
);

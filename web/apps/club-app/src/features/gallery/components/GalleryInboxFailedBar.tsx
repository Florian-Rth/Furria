import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GalleryInboxFailedItems } from '../hooks/use-gallery-inbox';
import { DISCARD_FAILED_LABEL, failedItemsLineOf } from '../inbox-copy';

interface GalleryInboxFailedBarProps {
  failedItems: GalleryInboxFailedItems;
}

export const GalleryInboxFailedBar: FC<GalleryInboxFailedBarProps> = ({ failedItems }) => {
  const line = failedItemsLineOf(failedItems.count);

  return (
    <Stack
      direction="row"
      role="status"
      sx={{ alignItems: 'center', columnGap: 1, px: 1, py: 0.5 }}
    >
      <KkMeta tone="accent" sx={{ flex: 1, minWidth: 0 }}>
        {line}
      </KkMeta>
      <KkButton
        size="small"
        variant="outlined"
        loading={failedItems.discarding}
        onClick={failedItems.discard}
      >
        {DISCARD_FAILED_LABEL}
      </KkButton>
    </Stack>
  );
};

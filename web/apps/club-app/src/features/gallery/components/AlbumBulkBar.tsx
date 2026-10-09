import { KkButton, KkIcon, KkSelectionBar } from '@furria/ui';
import type { FC } from 'react';
import { BULK_LABEL } from '../album-labels';
import type { AlbumBulk } from '../hooks/use-album-bulk';

interface AlbumBulkBarProps {
  bulk: AlbumBulk;
}

export const AlbumBulkBar: FC<AlbumBulkBarProps> = ({ bulk }) => {
  const deeds = bulk.deeds.map((deed) => {
    const icon = <KkIcon name={deed.icon} size="small" />;
    return (
      <KkButton
        key={deed.id}
        size="small"
        variant="outlined"
        tone={deed.tone}
        startIcon={icon}
        disabled={deed.disabled}
        onClick={deed.onSelect}
      >
        {deed.label}
      </KkButton>
    );
  });

  return (
    <KkSelectionBar label={BULK_LABEL} count={bulk.count}>
      {deeds}
    </KkSelectionBar>
  );
};

import type { KkFrameMark } from '@furria/ui';
import { KkButton, KkFrame, KkMeta, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PurgeCountdown } from '../bin-countdown';
import { countdownEdge, countdownLabel } from '../bin-countdown';
import { countLabel, thumbSourceOf } from '../gallery-view';
import type { BinnedAlbum } from '../schemas';

const REJECT_MARK: KkFrameMark = { kind: 'reject' };

const RESTORE_LABEL = 'Wiederherstellen';

interface GalleryBinAlbumCardProps {
  album: BinnedAlbum;
  countdown: PurgeCountdown;
  isRestoring: boolean;
  onRestore: (albumId: number) => void;
}

export const GalleryBinAlbumCard: FC<GalleryBinAlbumCardProps> = ({
  album,
  countdown,
  isRestoring,
  onRestore,
}) => {
  const source = album.cover === null ? undefined : thumbSourceOf(album.cover.urls);
  const restore = (): void => onRestore(album.albumId);
  const facts = `${countLabel(album.itemCount)} Bilder · ${countdownLabel(countdown)}`;
  const factsTone = countdown.urgency === 'urgent' ? 'accent' : 'muted';
  const edge = countdownEdge(countdown);

  return (
    <Stack sx={{ rowGap: 0.75, minWidth: 0 }}>
      <KkFrame
        label={album.title}
        source={source}
        latentLabel={album.title}
        number={edge}
        mark={REJECT_MARK}
      />
      <KkText variant="subtitle2" clamp={1}>
        {album.title}
      </KkText>
      <KkMeta tone={factsTone}>{facts}</KkMeta>
      <KkButton size="small" variant="outlined" onClick={restore} loading={isRestoring}>
        {RESTORE_LABEL}
      </KkButton>
    </Stack>
  );
};

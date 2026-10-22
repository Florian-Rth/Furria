import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { ALBUM_EYEBROW, albumDateLine, mediaCountLine } from '../album-labels';
import type { AlbumDetails } from '../schemas';

interface AlbumHeaderProps {
  album: AlbumDetails;
}

export const AlbumHeader: FC<AlbumHeaderProps> = ({ album }) => {
  const dateLine = albumDateLine(album);
  const countLine = mediaCountLine(album);

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{ALBUM_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{album.title}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          <KkMeta>{dateLine}</KkMeta>
          <KkMeta>{countLine}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};

import { KkSelectRow, KkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  SHEET_CLOSE,
  TIE_ALBUM_SHEET_ID,
  TIE_ALBUM_SHEET_TITLE,
  TIE_CANCELLED,
  TIE_EVENT_SHEET_ID,
  TIE_EVENT_SHEET_TITLE,
  TIE_PHOTOS,
} from '../../editor-copy';
import type { NewsTies } from '../../hooks/use-news-ties';
import { albumTieLineOf, eventTieLinesOf } from '../../tie-lines';

interface NewsTieSheetsProps {
  ties: NewsTies;
}

export const NewsTieSheets: FC<NewsTieSheetsProps> = ({ ties }) => {
  const today = new Date();
  const eventRows = ties.eventChoices.map((event) => {
    const handleTie = (): void => {
      ties.tieEvent(event.eventId);
    };
    return (
      <KkSelectRow
        key={event.eventId}
        title={event.title}
        meta={eventTieLinesOf(event, TIE_CANCELLED, today).line}
        selected={event.eventId === ties.event?.eventId}
        onClick={handleTie}
      />
    );
  });
  const albumRows = ties.albumChoices.map((album) => {
    const handleTie = (): void => {
      ties.tieAlbum(album.albumId);
    };
    return (
      <KkSelectRow
        key={album.albumId}
        title={album.title}
        meta={albumTieLineOf(album.photoCount, TIE_PHOTOS)}
        selected={album.albumId === ties.album?.albumId}
        onClick={handleTie}
      />
    );
  });

  return (
    <>
      <KkSheet id={TIE_EVENT_SHEET_ID} title={TIE_EVENT_SHEET_TITLE} closeLabel={SHEET_CLOSE}>
        <KkSheet.Body>
          <Stack>{eventRows}</Stack>
        </KkSheet.Body>
      </KkSheet>
      <KkSheet id={TIE_ALBUM_SHEET_ID} title={TIE_ALBUM_SHEET_TITLE} closeLabel={SHEET_CLOSE}>
        <KkSheet.Body>
          <Stack>{albumRows}</Stack>
        </KkSheet.Body>
      </KkSheet>
    </>
  );
};

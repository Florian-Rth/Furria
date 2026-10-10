import { KkAlbumTie, KkEventTie, KkText, KkTieOffer, KkTieSlot } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  TIE_ALBUM_EMPTY,
  TIE_DROPPED,
  TIE_EVENT_EMPTY,
  TIE_OFFER,
  TIE_RELEASE,
} from '../../editor-copy';
import type { NewsTies } from '../../hooks/use-news-ties';

interface NewsTieSlotsProps {
  ties: NewsTies;
  isReadOnly: boolean;
}

const EVENT_FIELD_ID = 'news-field-event';
const ALBUM_FIELD_ID = 'news-field-album';

export const NewsTieSlots: FC<NewsTieSlotsProps> = ({ ties, isReadOnly }) => {
  const { event, album, eventLines, albumLine } = ties;
  const eventSlot =
    event === null || eventLines === null ? null : (
      <KkTieSlot
        id={EVENT_FIELD_ID}
        releaseLabel={TIE_RELEASE}
        readOnly={isReadOnly}
        onRelease={ties.releaseEvent}
      >
        <KkEventTie
          day={eventLines.day}
          month={eventLines.month}
          title={event.title}
          line={eventLines.line}
        />
      </KkTieSlot>
    );
  const albumSlot =
    album === null || albumLine === null ? null : (
      <KkTieSlot
        id={ALBUM_FIELD_ID}
        releaseLabel={TIE_RELEASE}
        droppedNote={album.isPublished ? undefined : TIE_DROPPED}
        readOnly={isReadOnly}
        onRelease={ties.releaseAlbum}
      >
        <KkAlbumTie title={album.title} line={albumLine} cover={album.cover?.smallUrl ?? null} />
      </KkTieSlot>
    );
  const eventOffer =
    event === null ? (
      <KkTieOffer
        id={EVENT_FIELD_ID}
        icon="events"
        label={TIE_EVENT_EMPTY}
        onChoose={ties.chooseEvent}
      />
    ) : null;
  const albumOffer =
    album === null ? (
      <KkTieOffer
        id={ALBUM_FIELD_ID}
        icon="gallery"
        label={TIE_ALBUM_EMPTY}
        onChoose={ties.chooseAlbum}
      />
    ) : null;
  const hasOffer = !isReadOnly && (event === null || album === null);
  const offers = hasOffer ? (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <KkText variant="caption" tone="secondary">
        {TIE_OFFER}
      </KkText>
      {eventOffer}
      {albumOffer}
    </Stack>
  ) : null;

  return (
    <Stack sx={{ gap: 1 }}>
      {eventSlot}
      {albumSlot}
      {offers}
    </Stack>
  );
};

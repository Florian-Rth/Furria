import { KkCheckLine } from '@furria/ui/KkCheckLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { QUIET_NOTE } from '../event-board-copy';
import { toCountValue } from '../event-pane-copy';
import type { EventDetails } from '../schemas';
import { EventReviewAlbumsPanel } from './EventReviewAlbumsPanel';
import { EventReviewNewsPanel } from './EventReviewNewsPanel';

const ALBUMS_LABEL = 'Alben';
const NEWS_LABEL = 'Meldungen';

interface EventPaneReviewProps {
  event: EventDetails;
}

const countOrQuiet = (count: number): string =>
  count === 0 ? QUIET_NOTE : toCountValue(count, 'veröffentlicht', 'veröffentlicht');

export const EventPaneReview: FC<EventPaneReviewProps> = ({ event }) => {
  const { publishedAlbums, publishedNews } = event.review;
  const albums = countOrQuiet(publishedAlbums);
  const news = countOrQuiet(publishedNews);
  const albumsState = publishedAlbums > 0 ? 'done' : 'off';
  const newsState = publishedNews > 0 ? 'done' : 'off';

  return (
    <>
      <Stack>
        <KkCheckLine label={ALBUMS_LABEL} value={albums} state={albumsState} icon="gallery" />
        <KkCheckLine label={NEWS_LABEL} value={news} state={newsState} icon="news" />
      </Stack>
      <EventReviewAlbumsPanel event={event} />
      <EventReviewNewsPanel event={event} />
    </>
  );
};

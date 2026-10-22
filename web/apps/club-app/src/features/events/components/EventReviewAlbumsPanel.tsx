import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useEntryAlbums } from '@/features/gallery/api';
import { GALLERY_KEYS, GALLERY_SORT_KEYS } from '@/features/session/app-sections';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { toAlbumsCountNote } from '../event-review-copy';
import type { EventDetails } from '../schemas';
import { EventReviewAlbumRow } from './EventReviewAlbumRow';

const TITLE = 'Alben';
const ADD_LABEL = 'Album';
const ADD_ACTION_LABEL = 'Album zu diesem Abend anlegen';
const EMPTY_NOTE = 'Noch kein Album zu diesem Abend.';
const SKELETON_ROWS = 1;

interface EventReviewAlbumsPanelProps {
  event: EventDetails;
}

export const EventReviewAlbumsPanel: FC<EventReviewAlbumsPanelProps> = ({ event }) => {
  const permissions = usePermissions();
  const seesGallery = GALLERY_KEYS.some(permissions.has);
  const sortsGallery = GALLERY_SORT_KEYS.some(permissions.has);
  const entry = useEntryAlbums(event.eventId, event.startsAt, seesGallery);
  const action: KkPanelAction | undefined = sortsGallery
    ? {
        label: ADD_LABEL,
        icon: 'add',
        ariaLabel: ADD_ACTION_LABEL,
        component: Link,
        to: '/gallery/new',
        search: { entry: event.eventId },
      }
    : undefined;

  if (!seesGallery || entry.error !== null) {
    const countNote = toAlbumsCountNote(event.review.publishedAlbums);

    return (
      <KkPanelSection title={TITLE} action={action}>
        <KkNote>{countNote}</KkNote>
      </KkPanelSection>
    );
  }
  if (entry.isPending) {
    return (
      <KkPanelSection title={TITLE} action={action}>
        <KkSkeletonRow count={SKELETON_ROWS} />
      </KkPanelSection>
    );
  }

  const rows = entry.albums.map((album) => (
    <EventReviewAlbumRow key={album.albumId} album={album} />
  ));
  const body =
    rows.length === 0 ? <KkNote>{EMPTY_NOTE}</KkNote> : <KkPanel variant="list">{rows}</KkPanel>;

  return (
    <KkPanelSection title={TITLE} action={action}>
      {body}
    </KkPanelSection>
  );
};

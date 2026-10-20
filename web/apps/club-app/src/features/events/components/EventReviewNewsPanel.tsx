import type { KkPanelAction } from '@furria/ui';
import { KkNote, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NEW_POST_ID } from '@/features/news';
import { NEWS_KEYS, usePermissions } from '@/features/session';
import { toNewsCountNote } from '../event-review-copy';
import type { EventDetails } from '../schemas';

const TITLE = 'Meldungen';
const ADD_LABEL = 'Meldung';
const ADD_ACTION_LABEL = 'Meldung zu diesem Abend schreiben';

interface EventReviewNewsPanelProps {
  event: EventDetails;
}

export const EventReviewNewsPanel: FC<EventReviewNewsPanelProps> = ({ event }) => {
  const permissions = usePermissions();
  const writesNews = NEWS_KEYS.some(permissions.has);
  const note = toNewsCountNote(event.review.publishedNews);
  const action: KkPanelAction | undefined = writesNews
    ? {
        label: ADD_LABEL,
        icon: 'add',
        ariaLabel: ADD_ACTION_LABEL,
        component: Link,
        to: '/news/$postId',
        params: { postId: NEW_POST_ID },
      }
    : undefined;

  return (
    <KkPanelSection title={TITLE} action={action}>
      <KkNote>{note}</KkNote>
    </KkPanelSection>
  );
};

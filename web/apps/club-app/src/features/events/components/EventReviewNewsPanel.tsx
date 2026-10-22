import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NEW_POST_ID } from '@/features/news/news-copy';
import { NEWS_KEYS } from '@/features/session/app-sections';
import { usePermissions } from '@/features/session/hooks/use-permissions';
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

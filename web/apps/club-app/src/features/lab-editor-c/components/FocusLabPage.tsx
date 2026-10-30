import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { FOCUS_CLOSED, FOCUS_DENIED, FOCUS_MUSIC_PAGE, FOCUS_READ_ONLY } from '../focus-copy';
import { useFocusPage } from '../hooks/use-focus-page';
import type { FocusSearch } from '../schemas';
import { FocusBody } from './FocusBody';

interface FocusLabPageProps {
  actId: string;
  search: FocusSearch;
}

const SKELETON_LINES = 8;
const SESSION_KEY = 'session';

export const FocusLabPage: FC<FocusLabPageProps> = ({ actId, search }) => {
  const page = useFocusPage(actId, search.evening);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={FOCUS_DENIED} />;
  }

  const musicAction: KkQuietScreenAction = {
    id: 'music',
    label: FOCUS_MUSIC_PAGE,
    icon: 'music',
    onSelect: () => {
      page.openMusic('music');
    },
  };
  const studio = data?.studio;
  const bodyKey = `${page.actId}:${page.evening?.eventId ?? SESSION_KEY}`;
  const context = { evening: page.evening, startEditing: true, startHall: null };
  const editable =
    studio === null || studio === undefined ? (
      <KkEmptyState title={page.title} description={FOCUS_CLOSED} />
    ) : (
      <FocusBody
        key={bodyKey}
        actId={page.actId}
        studio={studio}
        viewerId={page.viewerId}
        canEdit={page.canEdit}
        cast={page.cast}
        context={context}
        openMusic={page.openMusic}
      />
    );
  const loaded = page.canEdit ? (
    editable
  ) : (
    <KkEmptyState title={page.title} description={FOCUS_READ_ONLY} />
  );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin} actions={[musicAction]}>
      {body}
    </KkScreen>
  );
};

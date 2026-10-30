import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { FOCUS_CLOSED, FOCUS_DENIED, FOCUS_MUSIC_PAGE, FOCUS_READ_ONLY } from '../focus-copy';
import { useFocusPage } from '../hooks/use-focus-page';
import type { FocusMusicSearch } from '../schemas';
import { FocusMusicBody } from './FocusMusicBody';

interface FocusMusicPageProps {
  actId: string;
  search: FocusMusicSearch;
}

const SKELETON_LINES = 6;
const NO_EVENING = undefined;

export const FocusMusicPage: FC<FocusMusicPageProps> = ({ actId, search }) => {
  const page = useFocusPage(actId, NO_EVENING);
  const data = page.query.data;
  const origin = { label: page.title, to: '/lab/editor-c/$actId', params: { actId } };

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={FOCUS_MUSIC_PAGE} origin={origin} message={FOCUS_DENIED} />;
  }

  const studio = data?.studio;
  const tool = search.tool ?? 'music';
  const editable =
    studio === null || studio === undefined ? (
      <KkEmptyState title={page.title} description={FOCUS_CLOSED} />
    ) : (
      <FocusMusicBody
        key={page.actId}
        actId={page.actId}
        studio={studio}
        viewerId={page.viewerId}
        cast={page.cast}
        canEdit={page.canEdit}
        tool={tool}
        choose={page.switchMusic}
      />
    );
  const loaded = page.canEdit ? (
    editable
  ) : (
    <KkEmptyState title={page.title} description={FOCUS_READ_ONLY} />
  );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={FOCUS_MUSIC_PAGE} origin={origin}>
      {body}
    </KkScreen>
  );
};

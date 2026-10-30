import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { EIGHTS_CLOSED, EIGHTS_DENIED, musicTitleOf } from '../eights-copy';
import { useEightsPage } from '../hooks/use-eights-page';
import { useEightsRoutes } from '../hooks/use-eights-routes';
import type { EightsMusicSearch } from '../schemas';
import { EightsMusicBody } from './EightsMusicBody';

interface EightsMusicPageProps {
  actId: string;
  search: EightsMusicSearch;
}

const SKELETON_LINES = 8;
const NO_ACT = 0;

export const EightsMusicPage: FC<EightsMusicPageProps> = ({ actId, search }) => {
  const page = useEightsPage(actId, search.evening);
  const routes = useEightsRoutes(page.actId ?? NO_ACT, page.evening?.eventId ?? null);
  const data = page.query.data;
  const title = musicTitleOf(page.title);

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={title} origin={page.origin} message={EIGHTS_DENIED} />;
  }

  const studio = data?.studio;
  const closedText = page.canEdit ? EIGHTS_CLOSED : EIGHTS_DENIED;
  const loaded =
    !page.canEdit || studio === null || studio === undefined ? (
      <KkEmptyState title={title} description={closedText} />
    ) : (
      <EightsMusicBody
        key={`${page.actId}:${page.evening?.eventId ?? 0}`}
        actId={page.actId}
        title={title}
        studio={studio}
        viewerId={page.viewerId}
        canEdit={page.canEdit}
        cast={page.cast}
        evening={page.evening}
        tab={search.tab}
      />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={title} origin={routes.editorOrigin}>
      {body}
    </KkScreen>
  );
};

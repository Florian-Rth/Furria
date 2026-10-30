import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { EIGHTS_CLOSED, EIGHTS_DENIED, EIGHTS_MUSIC_VIDEO } from '../eights-copy';
import { useEightsPage } from '../hooks/use-eights-page';
import { useEightsRoutes } from '../hooks/use-eights-routes';
import type { EightsSearch } from '../schemas';
import { EightsEditorBody } from './EightsEditorBody';

interface EightsEditorPageProps {
  actId: string;
  search: EightsSearch;
}

const SKELETON_LINES = 10;
const NO_ACT = 0;

export const EightsEditorPage: FC<EightsEditorPageProps> = ({ actId, search }) => {
  const page = useEightsPage(actId, search.evening);
  const routes = useEightsRoutes(page.actId ?? NO_ACT, page.evening?.eventId ?? null);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={EIGHTS_DENIED} />;
  }

  const openMusic = (): void => {
    routes.openMusic('music');
  };
  const actions: readonly [KkQuietScreenAction] = [
    { id: 'music', label: EIGHTS_MUSIC_VIDEO, icon: 'music', onSelect: openMusic },
  ];
  const bodyKey = `${page.actId}:${page.evening?.eventId ?? 0}`;
  const studio = data?.studio;
  const closedText = page.canEdit ? EIGHTS_CLOSED : EIGHTS_DENIED;
  const loaded =
    !page.canEdit || studio === null || studio === undefined ? (
      <KkEmptyState title={page.title} description={closedText} />
    ) : (
      <EightsEditorBody
        key={bodyKey}
        actId={page.actId}
        actName={page.title}
        studio={studio}
        viewerId={page.viewerId}
        canEdit={page.canEdit}
        cast={page.cast}
        evening={page.evening}
        zoom={search.zoom}
        openMusic={routes.openMusic}
      />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin} actions={actions}>
      {body}
    </KkScreen>
  );
};

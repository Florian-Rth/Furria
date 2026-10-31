import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useActMusicPage } from '../hooks/use-act-music-page';
import { useStudioVisit } from '../hooks/use-studio-visit';
import type { ActMusicSearch } from '../schemas';
import { MUSIC_PAGE_CLOSED, MUSIC_PAGE_DENIED, MUSIC_PAGE_TITLE } from '../step-cards-copy';
import { ActMusicBody } from './ActMusicBody';

interface ActMusicPageProps {
  actId: string;
  search: ActMusicSearch;
}

const SKELETON_LINES = 8;

export const ActMusicPage: FC<ActMusicPageProps> = ({ actId, search }) => {
  const page = useActMusicPage(actId, search);
  useStudioVisit(page.actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error) || (data !== undefined && !page.canEdit)) {
    return (
      <AccessDeniedScreen
        title={MUSIC_PAGE_TITLE}
        origin={page.origin}
        message={MUSIC_PAGE_DENIED}
      />
    );
  }

  const studio = data?.studio;
  const loaded =
    studio === null || studio === undefined ? (
      <KkEmptyState title={page.actName} description={MUSIC_PAGE_CLOSED} />
    ) : (
      <ActMusicBody page={page} actId={page.actId} studio={studio} />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={MUSIC_PAGE_TITLE} origin={page.origin}>
      <KkVisuallyHidden component="h1">{MUSIC_PAGE_TITLE}</KkVisuallyHidden>
      {body}
    </KkScreen>
  );
};

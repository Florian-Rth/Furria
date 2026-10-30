import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useLaneMusicPage } from '../hooks/use-lane-music-page';
import { LANE_CLOSED, LANE_DENIED } from '../lane-copy';
import type { LaneMusicSearch } from '../schemas';
import { LaneMusicBody } from './LaneMusicBody';

interface LaneMusicPageProps {
  actId: string;
  search: LaneMusicSearch;
}

const SKELETON_LINES = 8;

export const LaneMusicPage: FC<LaneMusicPageProps> = ({ actId, search }) => {
  const { page, tool, chooseTool, title } = useLaneMusicPage(actId, search);
  useStudioVisit(page.actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error) || (data !== undefined && !page.canEdit)) {
    return <AccessDeniedScreen title={title} origin={page.origin} message={LANE_DENIED} />;
  }

  const studio = data?.studio;
  const loaded =
    studio === null || studio === undefined ? (
      <KkEmptyState title={title} description={LANE_CLOSED} />
    ) : (
      <LaneMusicBody
        page={page}
        actId={page.actId}
        studio={studio}
        tool={tool}
        onTool={chooseTool}
      />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

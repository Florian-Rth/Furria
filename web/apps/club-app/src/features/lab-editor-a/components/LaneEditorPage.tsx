import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useLanePage } from '../hooks/use-lane-page';
import { LANE_CLOSED, LANE_DENIED } from '../lane-copy';
import type { LaneSearch } from '../schemas';
import { LaneEditorBody } from './LaneEditorBody';

interface LaneEditorPageProps {
  actId: string;
  search: LaneSearch;
}

const SKELETON_LINES = 8;
const SESSION_KEY = 'session';

export const LaneEditorPage: FC<LaneEditorPageProps> = ({ actId, search }) => {
  const page = useLanePage(actId, search);
  useStudioVisit(page.actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error) || (data !== undefined && !page.canEdit)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={LANE_DENIED} />;
  }

  const studio = data?.studio;
  const bodyKey = `${page.actId}:${page.evening?.eventId ?? SESSION_KEY}`;
  const loaded =
    studio === null || studio === undefined ? (
      <KkEmptyState title={page.title} description={LANE_CLOSED} />
    ) : (
      <LaneEditorBody key={bodyKey} page={page} actId={page.actId} studio={studio} />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import { KkStudioFClosed } from '@furria/ui/KkStudioFClosed';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioFPage } from '../hooks/use-studio-f-page';
import { STUDIO_F_DENIED, STUDIO_F_NO_ACCESS } from '../studio-f-copy';
import { StudioFLessonView } from './StudioFLessonView';

interface StudioFPageProps {
  actId: string;
}

const SKELETON_LINES = 8;

export const StudioFPage: FC<StudioFPageProps> = ({ actId }) => {
  const page = useStudioFPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={STUDIO_F_DENIED} />;
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : data.studio === null ? (
      <KkStudioFClosed name={data.act.name} line={STUDIO_F_NO_ACCESS} />
    ) : (
      <StudioFLessonView studio={data.studio} viewerId={page.viewerId} />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

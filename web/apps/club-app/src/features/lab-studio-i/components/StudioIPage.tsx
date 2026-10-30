import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioIPage } from '../hooks/use-studio-i-page';
import { STUDIO_I_CLOSED, STUDIO_I_DENIED } from '../studio-i-copy';
import { StudioIBody } from './StudioIBody';

interface StudioIPageProps {
  actId: string;
}

const SKELETON_LINES = 6;

export const StudioIPage: FC<StudioIPageProps> = ({ actId }) => {
  const page = useStudioIPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={STUDIO_I_DENIED} />;
  }
  if (data !== undefined && data.studio !== null) {
    return (
      <StudioIBody
        key={page.actId}
        actId={page.actId}
        title={page.title}
        origin={page.origin}
        studio={data.studio}
        viewerId={page.viewerId}
        canEdit={data.viewer.canEditStudio}
      />
    );
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : (
      <KkEmptyState title={data.act.name} description={STUDIO_I_CLOSED} />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

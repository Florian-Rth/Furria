import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioHPage } from '../hooks/use-studio-h-page';
import { STUDIO_H_DENIED } from '../studio-h-copy';
import { StudioHBody } from './StudioHBody';
import { StudioHClosed } from './StudioHClosed';

interface StudioHPageProps {
  actId: string;
}

const SKELETON_LINES = 6;

export const StudioHPage: FC<StudioHPageProps> = ({ actId }) => {
  const page = useStudioHPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={STUDIO_H_DENIED} />;
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : data.studio === null ? (
      <StudioHClosed name={data.act.name} />
    ) : (
      <StudioHBody
        actId={page.actId}
        studio={data.studio}
        viewerId={page.viewerId}
        canEdit={data.viewer.canEditStudio}
      />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

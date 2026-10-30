import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioGPage } from '../hooks/use-studio-g-page';
import { STUDIO_G_CLOSED, STUDIO_G_DENIED } from '../studio-g-copy';
import { StudioGBody } from './StudioGBody';

interface StudioGPageProps {
  actId: string;
}

const SKELETON_LINES = 6;

export const StudioGPage: FC<StudioGPageProps> = ({ actId }) => {
  const page = useStudioGPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={STUDIO_G_DENIED} />;
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : data.studio === null ? (
      <KkEmptyState title={data.act.name} description={STUDIO_G_CLOSED} />
    ) : (
      <StudioGBody
        key={page.actId}
        actId={page.actId}
        actName={data.act.name}
        studio={data.studio}
        viewerId={page.viewerId}
        mode={page.mode}
      />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin} actions={page.actions}>
      {body}
    </KkScreen>
  );
};

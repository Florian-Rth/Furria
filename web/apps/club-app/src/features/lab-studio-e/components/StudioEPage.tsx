import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioEPage } from '../hooks/use-studio-e-page';
import { STUDIO_E_DENIED } from '../studio-e-copy';
import { StudioEBody } from './StudioEBody';
import { StudioEClosed } from './StudioEClosed';

interface StudioEPageProps {
  actId: string;
}

const SKELETON_LINES = 6;

export const StudioEPage: FC<StudioEPageProps> = ({ actId }) => {
  const page = useStudioEPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={STUDIO_E_DENIED} />;
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : data.studio === null ? (
      <StudioEClosed name={data.act.name} />
    ) : (
      <StudioEBody studio={data.studio} viewerId={page.viewerId} />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

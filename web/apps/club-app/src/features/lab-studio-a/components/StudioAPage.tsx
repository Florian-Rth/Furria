import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioAPage } from '../hooks/use-studio-a-page';
import { STUDIO_A_DENIED } from '../studio-a-copy';
import { StudioABody } from './StudioABody';
import { StudioAClosed } from './StudioAClosed';

interface StudioAPageProps {
  actId: string;
}

const SKELETON_LINES = 8;

export const StudioAPage: FC<StudioAPageProps> = ({ actId }) => {
  const page = useStudioAPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={STUDIO_A_DENIED} />;
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : data.studio === null ? (
      <StudioAClosed response={data} />
    ) : (
      <StudioABody studio={data.studio} viewer={data.viewer} viewerId={page.viewerId} />
    );

  return (
    <KkScreen kind="detail" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

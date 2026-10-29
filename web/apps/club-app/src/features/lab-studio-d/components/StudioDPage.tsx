import { KkScreen } from '@furria/ui/KkScreen';
import { KkStudioDPlayer } from '@furria/ui/KkStudioDPlayer';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useStudioDPage } from '../hooks/use-studio-d-page';
import { STUDIO_D_DENIED, STUDIO_D_NO_ACCESS } from '../studio-d-copy';
import { StudioDBody } from './StudioDBody';
import { StudioDClosed } from './StudioDClosed';

interface StudioDPageProps {
  actId: string;
}

export const StudioDPage: FC<StudioDPageProps> = ({ actId }) => {
  const page = useStudioDPage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={LAB_ORIGIN} message={STUDIO_D_DENIED} />;
  }

  const eyebrow = data?.act.group?.name ?? null;
  const noAccess = <KkStudioDPlayer.Note>{STUDIO_D_NO_ACCESS}</KkStudioDPlayer.Note>;
  const body =
    data === undefined ? (
      <StudioDClosed title={page.title} eyebrow={eyebrow} onClose={page.close} />
    ) : data.studio === null ? (
      <StudioDClosed title={page.title} eyebrow={eyebrow} note={noAccess} onClose={page.close} />
    ) : (
      <StudioDBody
        studio={data.studio}
        title={page.title}
        eyebrow={eyebrow}
        viewerId={page.viewerId}
        onClose={page.close}
      />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={LAB_ORIGIN}>
      {body}
    </KkScreen>
  );
};

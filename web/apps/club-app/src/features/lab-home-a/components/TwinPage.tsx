import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { PRACTICE_DENIED } from '@/features/act-practice/practice-copy';
import { useHomePage } from '@/features/lab-home/hooks/use-home-page';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { TwinLoaded } from './TwinLoaded';

interface TwinPageProps {
  actId: string;
}

const SKELETON_LINES = 8;

export const TwinPage: FC<TwinPageProps> = ({ actId }) => {
  const page = useHomePage(actId);
  const goBackTo = useGoBackTo();
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={PRACTICE_DENIED} />;
  }

  const close = (): void => {
    void goBackTo({ href: page.origin.to });
  };
  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : (
      <TwinLoaded
        actId={page.actId}
        studio={data.studio}
        title={page.title}
        viewerId={page.viewerId}
        onClose={close}
        onHall={page.openHall}
      />
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

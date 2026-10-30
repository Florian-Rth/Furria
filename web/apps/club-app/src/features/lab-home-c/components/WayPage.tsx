import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { PRACTICE_DENIED, PRACTICE_NO_ACCESS } from '@/features/act-practice/practice-copy';
import { HOME_HALL } from '@/features/lab-home/home-copy';
import { useHomePage } from '@/features/lab-home/hooks/use-home-page';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { WayBody } from './WayBody';

interface WayPageProps {
  actId: string;
}

const SKELETON_LINES = 8;

export const WayPage: FC<WayPageProps> = ({ actId }) => {
  const page = useHomePage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={PRACTICE_DENIED} />;
  }

  const hallAction: KkQuietScreenAction = {
    id: 'hall',
    label: HOME_HALL,
    icon: 'group',
    onSelect: page.openHall,
  };
  const studio = data?.studio;
  const loaded =
    studio === null || studio === undefined ? (
      <KkEmptyState title={page.title} description={PRACTICE_NO_ACCESS} />
    ) : (
      <WayBody key={page.actId} actId={page.actId} studio={studio} viewerId={page.viewerId} />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;
  const actions = studio === null || studio === undefined ? undefined : ([hallAction] as const);

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin} actions={actions}>
      {body}
    </KkScreen>
  );
};

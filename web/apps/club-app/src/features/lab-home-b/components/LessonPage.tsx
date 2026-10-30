import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC, ReactNode } from 'react';
import { PRACTICE_DENIED, PRACTICE_NO_ACCESS } from '@/features/act-practice/practice-copy';
import { canPractise } from '@/features/acts/act-studio';
import type { ActStudioResponse } from '@/features/acts/schemas';
import type { HomePage } from '@/features/lab-home/hooks/use-home-page';
import { useHomePage } from '@/features/lab-home/hooks/use-home-page';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { LessonBody } from './LessonBody';
import { LessonEmpty } from './LessonEmpty';

const SKELETON_LINES = 8;

interface LessonPageProps {
  actId: string;
}

const loadedOf = (page: HomePage, actId: number, data: ActStudioResponse): ReactNode => {
  const { studio } = data;

  if (studio === null) {
    return <KkEmptyState title={page.title} description={PRACTICE_NO_ACCESS} />;
  }
  if (!canPractise(studio)) {
    return <LessonEmpty title={page.title} />;
  }

  return (
    <LessonBody
      key={actId}
      actId={actId}
      title={page.title}
      studio={studio}
      viewerId={page.viewerId}
      onHall={page.openHall}
    />
  );
};

export const LessonPage: FC<LessonPageProps> = ({ actId }) => {
  const page = useHomePage(actId);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={PRACTICE_DENIED} />;
  }

  const body =
    data === undefined ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : (
      loadedOf(page, page.actId, data)
    );

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { HALL_CLOSED, HALL_DENIED } from '../hall-copy';
import type { HallVariant } from '../hall-variants';
import { useHallLabPage } from '../hooks/use-hall-lab-page';
import type { HallSearch } from '../schemas';
import { HallBody } from './HallBody';

interface HallLabPageProps {
  actId: string;
  variant: HallVariant;
  search: HallSearch;
}

const SKELETON_LINES = 8;

export const HallLabPage: FC<HallLabPageProps> = ({ actId, variant, search }) => {
  const page = useHallLabPage(actId, search);
  const data = page.query.data;

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return <AccessDeniedScreen title={page.title} origin={page.origin} message={HALL_DENIED} />;
  }

  const bodyKey = `${page.actId}:${page.training?.calendarEntryId ?? 0}`;
  const studio = data?.studio;
  const loaded =
    studio === null || studio === undefined ? (
      <KkEmptyState title={page.title} description={HALL_CLOSED} />
    ) : (
      <HallBody
        key={bodyKey}
        studio={studio}
        actId={page.actId}
        training={page.training}
        variant={variant}
      />
    );
  const body = data === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};

import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isNotFoundError } from '@/lib/query-error';
import {
  EMPTY_TEXT,
  EMPTY_TITLE,
  HEUTE_A_TITLE,
  LOAD_FAILED_TEXT,
  LOAD_FAILED_TITLE,
  RETRY,
} from '../heute-a-copy';
import { useHeuteA } from '../hooks/use-heute-a';
import { HeuteBoard } from './HeuteBoard';

interface HeuteAPageProps {
  eventId: string;
}

const SKELETON_LINES = 6;

export const HeuteAPage: FC<HeuteAPageProps> = ({ eventId }) => {
  const heute = useHeuteA(eventId);
  const data = heute.query.data;
  const retry = (): void => {
    void heute.query.refetch();
  };

  if (!heute.validId || isNotFoundError(heute.query.error)) {
    return <ScreenNotFound />;
  }

  const failed = (
    <KkErrorState
      title={LOAD_FAILED_TITLE}
      description={LOAD_FAILED_TEXT}
      action={<KkButton onClick={retry}>{RETRY}</KkButton>}
    />
  );
  const waiting = heute.query.isError ? failed : <KkSkeletonBlock lines={SKELETON_LINES} />;
  const loaded =
    data?.lines.length === 0 ? (
      <KkEmptyState title={EMPTY_TITLE} description={EMPTY_TEXT} />
    ) : (
      <HeuteBoard heute={heute} />
    );
  const body = data === undefined ? waiting : loaded;

  return (
    <KkScreen kind="fullscreen" title={HEUTE_A_TITLE} origin={LAB_ORIGIN}>
      {body}
    </KkScreen>
  );
};

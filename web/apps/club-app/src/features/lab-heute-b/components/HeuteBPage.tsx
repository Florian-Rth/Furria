import { KkHall } from '@furria/ui/KkHall';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { isNotFoundError } from '@/lib/query-error';
import { HEUTE_LABEL, LOAD_FAILED, NOT_FOUND } from '../heute-b-copy';
import { useHeute } from '../hooks/use-heute';
import { HeuteCallList } from './HeuteCallList';
import { HeuteHead } from './HeuteHead';
import { HeuteKeys } from './HeuteKeys';
import { HeuteLayout } from './HeuteLayout';
import { HeuteStage } from './HeuteStage';
import { HeuteStrip } from './HeuteStrip';

interface HeuteBPageProps {
  eventId: string;
}

const SKELETON_LINES = 6;

export const HeuteBPage: FC<HeuteBPageProps> = ({ eventId }) => {
  const heute = useHeute(eventId);
  const data = heute.query.data;
  const title = data?.title ?? HEUTE_LABEL;
  const failedMessage = isNotFoundError(heute.query.error) ? NOT_FOUND : LOAD_FAILED;
  const retry = (): void => {
    void heute.query.refetch();
  };
  const loading =
    heute.query.isError && data === undefined ? (
      <KkRetryAlert message={failedMessage} retrying={heute.query.isFetching} onRetry={retry} />
    ) : (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    );
  const stage = data === undefined ? loading : <HeuteStage heute={heute} />;
  const head = <HeuteHead title={title} eveningSince={heute.eveningSince} onClose={heute.close} />;
  const strip = <HeuteStrip chips={heute.chips} focusId={heute.stripFocusId} />;
  const call = <HeuteCallList groups={heute.calls} />;
  const keys = <HeuteKeys heute={heute} />;

  return (
    <KkScreen kind="fullscreen" title={title} origin={LAB_ORIGIN}>
      <KkHall label={title}>
        <HeuteLayout head={head} strip={strip} stage={stage} call={call} keys={keys} />
      </KkHall>
    </KkScreen>
  );
};

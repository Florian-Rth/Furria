import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { DENIED_MESSAGE, FAILED_LINE, RETRY_LABEL } from '../beer-list-copy';
import type { BeerListLoad } from '../hooks/use-beer-list-page';

interface BeerListPendingProps {
  load: BeerListLoad;
}

export const BeerListPending: FC<BeerListPendingProps> = ({ load }) => {
  if (load.state === 'denied') {
    return <AccessDenied message={DENIED_MESSAGE} />;
  }

  if (load.state === 'failed') {
    const retry = (
      <KkButton loading={load.retrying} onClick={load.retry}>
        {RETRY_LABEL}
      </KkButton>
    );
    const title = load.failure ?? FAILED_LINE;

    return <KkErrorState title={title} description={FAILED_LINE} action={retry} />;
  }

  return <KkSkeletonRow count={4} />;
};

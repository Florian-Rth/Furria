import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import { KkText } from '@furria/ui/KkText';
import type { FC, ReactNode } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useBeerPotsQuery } from '../api';
import { ERROR_TITLE, POTS_CONTEXT, POTS_EMPTY, POTS_TITLE, RETRY_LABEL } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPotRow } from './BeerPotRow';

export const BeerPotsPane: FC = () => {
  const potsQuery = useBeerPotsQuery();
  const retry = (): void => {
    void potsQuery.refetch();
  };
  const bodyOf = (): ReactNode => {
    const pots = potsQuery.data?.pots;

    if (pots === undefined) {
      if (potsQuery.error === null) {
        return <KkSkeletonRow count={3} shape="select" />;
      }

      const message = toWriteErrorMessage(potsQuery.error) ?? '';
      const action = <KkButton onClick={retry}>{RETRY_LABEL}</KkButton>;

      return <KkErrorState title={ERROR_TITLE} description={message} action={action} />;
    }

    const closed = pots.filter((pot) => pot.closedAt !== null);

    if (closed.length === 0) {
      return (
        <KkText variant="body2" tone="secondary">
          {POTS_EMPTY}
        </KkText>
      );
    }

    const rows = closed.map((pot) => <BeerPotRow key={pot.beerPotId} pot={pot} />);

    return <KkPanel>{rows}</KkPanel>;
  };
  const body = bodyOf();

  return (
    <BeerPaneFrame icon="archive" title={POTS_TITLE} context={POTS_CONTEXT}>
      {body}
    </BeerPaneFrame>
  );
};

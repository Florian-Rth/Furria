import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC, ReactNode } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useBeerHubContext } from '../beer-hub-context';
import { ERROR_TITLE, RETRY_LABEL } from '../beer-hub-copy';
import { BeerHubOpen } from './BeerHubOpen';
import { BeerOpenPotForm } from './BeerOpenPotForm';
import { BeerPaneSlot } from './BeerPaneSlot';

const MASTER_SPAN_WIDE = 7;
const MASTER_SPAN_NARROW = 12;

export const BeerHubBody: FC = () => {
  const hub = useBeerHubContext();
  const { state } = hub;
  const reloadButton = <KkButton onClick={hub.reload}>{RETRY_LABEL}</KkButton>;
  const masterOf = (): ReactNode => {
    switch (state.kind) {
      case 'open':
        return <BeerHubOpen open={state.open} />;
      case 'empty':
        return <BeerOpenPotForm />;
      case 'failed':
        return (
          <KkErrorState
            title={ERROR_TITLE}
            description={toWriteErrorMessage(state.error) ?? ''}
            action={reloadButton}
          />
        );
      default:
        return <KkSkeletonRow count={8} shape="select" />;
    }
  };
  const master = masterOf();
  const roster = state.kind === 'open' ? state.open.focusRoster : null;

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={hub.isWide ? MASTER_SPAN_WIDE : MASTER_SPAN_NARROW}>
        {master}
      </KkMasterDetail.Master>
      <BeerPaneSlot roster={roster} />
    </KkMasterDetail>
  );
};

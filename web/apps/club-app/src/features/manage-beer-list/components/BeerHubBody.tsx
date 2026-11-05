import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { HUB_SPANS } from '../hub-layout';
import { BeerHubMaster } from './BeerHubMaster';
import { BeerPaneSlot } from './BeerPaneSlot';

export const BeerHubBody: FC = () => {
  const { state, isWide } = useBeerHubContext();
  const roster = state.kind === 'open' ? state.open.roster : null;
  const masterSpan = isWide ? HUB_SPANS.masterWide : HUB_SPANS.masterNarrow;

  return (
    <KkMasterDetail>
      <KkMasterDetail.Master span={masterSpan}>
        <BeerHubMaster />
      </KkMasterDetail.Master>
      <BeerPaneSlot roster={roster} />
    </KkMasterDetail>
  );
};

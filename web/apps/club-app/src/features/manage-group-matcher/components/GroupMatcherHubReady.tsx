import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import type { GroupMatcherHubView } from '../group-matcher-hub-context';
import { GroupMatcherHubContext } from '../group-matcher-hub-context';
import { HUB_SPANS } from '../hub-layout';
import { GroupMatcherHubMaster } from './GroupMatcherHubMaster';
import { GroupMatcherPaneSlot } from './GroupMatcherPaneSlot';

interface GroupMatcherHubReadyProps {
  view: GroupMatcherHubView;
}

export const GroupMatcherHubReady: FC<GroupMatcherHubReadyProps> = ({ view }) => {
  const masterSpan =
    view.isWide && view.pane !== null ? HUB_SPANS.masterWithPane : HUB_SPANS.masterAlone;

  return (
    <GroupMatcherHubContext value={view}>
      <KkMasterDetail>
        <KkMasterDetail.Master span={masterSpan}>
          <GroupMatcherHubMaster />
        </KkMasterDetail.Master>
        <GroupMatcherPaneSlot />
      </KkMasterDetail>
    </GroupMatcherHubContext>
  );
};

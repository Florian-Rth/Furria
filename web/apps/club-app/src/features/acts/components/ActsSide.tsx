import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { CLOSE_LABEL, toPaneTitle } from '../acts-copy';
import type { ActsHub } from '../hooks/use-acts-hub';
import { NEW_ACT } from '../schemas';
import { ActPane } from './ActPane';

const PANE_SPAN = 5;

interface ActsSideProps {
  hub: ActsHub;
}

export const ActsSide: FC<ActsSideProps> = ({ hub }) => {
  const isNew = hub.selection === NEW_ACT;

  if (hub.selection === null || (!isNew && hub.selectedAct === null)) {
    return null;
  }

  const paneKey = String(hub.selection);
  const acts = hub.query.data?.acts ?? [];
  const title = toPaneTitle(isNew);
  const spotlightId = hub.spotlight?.person.personId ?? null;
  const fixedGroupId = hub.scope.kind === 'group' ? hub.scope.groupId : null;
  const pane = (
    <ActPane
      key={paneKey}
      act={hub.selectedAct}
      acts={acts}
      fixedGroupId={fixedGroupId}
      framed={hub.isWide}
      spotlightId={spotlightId}
      onToggleSpotlight={hub.toggleSpotlight}
      onCreated={hub.created}
      onClose={hub.close}
    />
  );

  if (!hub.isWide) {
    return (
      <KkBottomDrawer open label={title} closeLabel={CLOSE_LABEL} onClose={hub.close}>
        {pane}
      </KkBottomDrawer>
    );
  }

  return <KkMasterDetail.Detail span={PANE_SPAN}>{pane}</KkMasterDetail.Detail>;
};

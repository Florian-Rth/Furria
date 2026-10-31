import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { CLOSE_LABEL, NEW_ACT_TITLE } from '../acts-copy';
import type { ActsHub } from '../hooks/use-acts-hub';
import { ActPane } from './ActPane';

const PANE_SPAN = 5;

interface ActsSideProps {
  hub: ActsHub;
}

export const ActsSide: FC<ActsSideProps> = ({ hub }) => {
  if (!hub.isCreating) {
    return null;
  }

  const acts = hub.query.data?.acts ?? [];
  const fixedGroupId = hub.scope.kind === 'group' ? hub.scope.groupId : null;
  const pane = (
    <ActPane
      act={null}
      acts={acts}
      fixedGroupId={fixedGroupId}
      framed={hub.isWide}
      onCreated={hub.created}
      onClose={hub.close}
    />
  );

  if (!hub.isWide) {
    return (
      <KkBottomDrawer open label={NEW_ACT_TITLE} closeLabel={CLOSE_LABEL} onClose={hub.close}>
        {pane}
      </KkBottomDrawer>
    );
  }

  return <KkMasterDetail.Detail span={PANE_SPAN}>{pane}</KkMasterDetail.Detail>;
};

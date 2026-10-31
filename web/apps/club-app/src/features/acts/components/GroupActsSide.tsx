import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { CLOSE_LABEL, NEW_ACT_TITLE } from '../acts-copy';
import type { GroupActHistory } from '../hooks/use-group-act-history';
import { ActPane } from './ActPane';

const PANE_SPAN = 5;

interface GroupActsSideProps {
  history: GroupActHistory;
}

export const GroupActsSide: FC<GroupActsSideProps> = ({ history }) => {
  if (!history.isCreating) {
    return null;
  }

  const pane = (
    <ActPane
      act={null}
      acts={history.paneActs}
      fixedGroupId={history.groupId}
      framed={history.isWide}
      onCreated={history.created}
      onClose={history.close}
    />
  );

  if (!history.isWide) {
    return (
      <KkBottomDrawer open label={NEW_ACT_TITLE} closeLabel={CLOSE_LABEL} onClose={history.close}>
        {pane}
      </KkBottomDrawer>
    );
  }

  return <KkMasterDetail.Detail span={PANE_SPAN}>{pane}</KkMasterDetail.Detail>;
};

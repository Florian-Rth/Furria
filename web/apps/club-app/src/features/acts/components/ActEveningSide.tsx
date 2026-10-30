import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { EVENING_PANE_LABEL } from '../act-evenings-copy';
import { CLOSE_LABEL } from '../acts-copy';
import type { ActEveningPaneState } from '../hooks/use-act-evening-pane';
import type { ActPageState } from '../hooks/use-act-page';
import { ActEveningPane } from './ActEveningPane';

const PANE_SPAN = 5;

interface ActEveningSideProps {
  page: ActPageState;
  pane: ActEveningPaneState;
}

export const ActEveningSide: FC<ActEveningSideProps> = ({ page, pane }) => {
  const body = <ActEveningPane pane={pane} framed={page.isWide} onClose={page.closeEvening} />;

  if (!page.isWide) {
    return (
      <KkBottomDrawer
        open
        label={EVENING_PANE_LABEL}
        closeLabel={CLOSE_LABEL}
        onClose={page.closeEvening}
      >
        {body}
      </KkBottomDrawer>
    );
  }

  return <KkMasterDetail.Detail span={PANE_SPAN}>{body}</KkMasterDetail.Detail>;
};

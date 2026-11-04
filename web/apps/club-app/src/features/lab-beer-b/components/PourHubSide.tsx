import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC, ReactNode } from 'react';
import { Fragment } from 'react';
import type { PourHub, PourSide } from '../hooks/use-pour-hub';
import { CLOSE_LABEL, POUR_HUB_TITLE } from '../pour-copy';
import { PourCorrectionPane } from './PourCorrectionPane';
import { PourCratePane } from './PourCratePane';
import { PourDeliveryPane } from './PourDeliveryPane';
import { PourPaymentPane } from './PourPaymentPane';
import { PourPersonPane } from './PourPersonPane';
import { PourSettingsPane } from './PourSettingsPane';

const PANE_SPAN = 5;

const keyOf = (side: PourSide): string => {
  switch (side.kind) {
    case 'person':
      return `person-${side.personId}`;
    case 'form':
      return `form-${side.form}-${side.personId ?? 0}`;
    default:
      return 'settings';
  }
};

const paneOf = (hub: PourHub, side: PourSide, framed: boolean, actions: ReactNode): ReactNode => {
  if (side.kind === 'person') {
    return (
      <PourPersonPane
        world={hub.world}
        personId={side.personId}
        framed={framed}
        actions={actions}
        onPay={hub.payment}
        onEnd={hub.endFor}
        onFilter={hub.filterPerson}
      />
    );
  }

  if (side.kind === 'settings') {
    return <PourSettingsPane hub={hub} tab={side.tab} framed={framed} actions={actions} />;
  }

  switch (side.form) {
    case 'payment':
      return (
        <PourPaymentPane
          hub={hub}
          initialPersonId={side.personId}
          framed={framed}
          actions={actions}
        />
      );
    case 'crate':
      return (
        <PourCratePane
          hub={hub}
          initialPersonId={side.personId}
          framed={framed}
          actions={actions}
        />
      );
    case 'delivery':
      return <PourDeliveryPane hub={hub} framed={framed} actions={actions} />;
    default:
      return <PourCorrectionPane hub={hub} framed={framed} actions={actions} />;
  }
};

interface PourHubSideProps {
  hub: PourHub;
}

export const PourHubSide: FC<PourHubSideProps> = ({ hub }) => {
  const side = hub.side;

  if (side === null) {
    return null;
  }

  const key = keyOf(side);

  if (!hub.isWide) {
    const pane = paneOf(hub, side, false, undefined);

    return (
      <KkBottomDrawer open label={POUR_HUB_TITLE} closeLabel={CLOSE_LABEL} onClose={hub.closeSide}>
        <Fragment key={key}>{pane}</Fragment>
      </KkBottomDrawer>
    );
  }

  const close = (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={hub.closeSide} />
  );
  const pane = paneOf(hub, side, true, close);

  return (
    <KkMasterDetail.Detail span={PANE_SPAN} key={key}>
      {pane}
    </KkMasterDetail.Detail>
  );
};

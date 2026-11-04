import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import {
  CLOSE_LABEL,
  CRATE_FOR_PANE,
  ENROLLMENTS_PANE,
  HANDOVER_PANE,
  paymentTitle,
  SETTINGS_PANE,
  STOCK_PANE,
} from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import type { BeerAStockView } from '../beer-a-queue';
import type { BeerAHub, BeerAPaneKind, BeerASelection } from '../hooks/use-beer-hub-a';
import { BeerHubAPaneBody } from './BeerHubAPaneBody';

const PANE_TITLES: Record<BeerAPaneKind, string> = {
  stock: STOCK_PANE,
  enrollments: ENROLLMENTS_PANE,
  crateFor: CRATE_FOR_PANE,
  settings: SETTINGS_PANE,
  handover: HANDOVER_PANE,
};

const titleOf = (selection: BeerASelection): string =>
  selection.kind === 'payment'
    ? paymentTitle(nameOf(labBeerPersonOf(selection.personId)))
    : PANE_TITLES[selection.kind];

interface BeerHubASideProps {
  hub: BeerAHub;
  stock: BeerAStockView;
}

export const BeerHubASide: FC<BeerHubASideProps> = ({ hub, stock }) => {
  const { selection } = hub;

  if (selection === null) {
    return null;
  }

  const title = titleOf(selection);
  const body = <BeerHubAPaneBody hub={hub} selection={selection} stock={stock} />;

  if (!hub.isWide) {
    return (
      <KkBottomDrawer open label={title} closeLabel={CLOSE_LABEL} onClose={hub.close}>
        <KkPaneLayout.PaneHead title={title} />
        <KkPaneLayout.PaneBody>{body}</KkPaneLayout.PaneBody>
      </KkBottomDrawer>
    );
  }

  return (
    <KkPaneLayout.Pane label={title}>
      <KkPaneLayout.PaneHead title={title} closeLabel={CLOSE_LABEL} onClose={hub.close} />
      <KkPaneLayout.PaneBody>{body}</KkPaneLayout.PaneBody>
    </KkPaneLayout.Pane>
  );
};

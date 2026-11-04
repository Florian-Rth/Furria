import type { FC } from 'react';
import { isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type { BeerAStockView } from '../beer-a-queue';
import type { BeerAHub, BeerASelection } from '../hooks/use-beer-hub-a';
import { BeerHubACrateForPane } from './BeerHubACrateForPane';
import { BeerHubAEnrollmentsPane } from './BeerHubAEnrollmentsPane';
import { BeerHubAHandoverPane } from './BeerHubAHandoverPane';
import { BeerHubAPaymentPane } from './BeerHubAPaymentPane';
import { BeerHubASettingsPane } from './BeerHubASettingsPane';
import { BeerHubAStockPane } from './BeerHubAStockPane';

interface BeerHubAPaneBodyProps {
  hub: BeerAHub;
  selection: BeerASelection;
  stock: BeerAStockView;
}

export const BeerHubAPaneBody: FC<BeerHubAPaneBodyProps> = ({ hub, selection, stock }) => {
  const { world, actions } = hub;

  switch (selection.kind) {
    case 'payment': {
      const tab = tabOf(selection.personId, world.crates, world.payments);
      const lastPaidAt =
        world.payments
          .filter((payment) => payment.personId === selection.personId)
          .map((payment) => payment.bookedAt)
          .sort()
          .at(-1) ?? null;

      return (
        <BeerHubAPaymentPane
          key={`${selection.personId}-${tab.openCount}`}
          tab={tab}
          person={labBeerPersonOf(selection.personId)}
          enrolled={isEnrolled(world, selection.personId)}
          lastPaidAt={lastPaidAt}
          now={hub.now}
          pay={actions.pay}
        />
      );
    }
    case 'stock':
      return (
        <BeerHubAStockPane
          world={world}
          view={stock}
          deliver={actions.deliver}
          correct={actions.correct}
        />
      );
    case 'enrollments':
      return <BeerHubAEnrollmentsPane world={world} end={actions.end} />;
    case 'crateFor':
      return (
        <BeerHubACrateForPane
          world={world}
          stock={stock.stock}
          bookFor={actions.bookFor}
          undo={actions.undo}
        />
      );
    case 'settings':
      return <BeerHubASettingsPane pot={world.pot} saveSettings={actions.saveSettings} />;
    case 'handover':
      return (
        <BeerHubAHandoverPane owner={labBeerPersonOf(world.pot.ownerId)} stock={stock.stock} />
      );
  }
};

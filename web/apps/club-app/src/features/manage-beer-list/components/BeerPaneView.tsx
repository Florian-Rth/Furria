import type { FC } from 'react';
import type { BeerPane } from '../beer-pane';
import { BeerClosedPotPane } from './BeerClosedPotPane';
import { BeerCodePane } from './BeerCodePane';
import { BeerCratesPane } from './BeerCratesPane';
import { BeerEnrollmentsPane } from './BeerEnrollmentsPane';
import { BeerHandoverPane } from './BeerHandoverPane';
import { BeerPaymentPane } from './BeerPaymentPane';
import { BeerPersonPane } from './BeerPersonPane';
import { BeerPotsPane } from './BeerPotsPane';
import { BeerSettingsPane } from './BeerSettingsPane';
import { BeerStockPane } from './BeerStockPane';

interface BeerPaneViewProps {
  pane: BeerPane | null;
}

export const BeerPaneView: FC<BeerPaneViewProps> = ({ pane }) => {
  switch (pane?.kind) {
    case 'stock':
      return <BeerStockPane />;
    case 'payment':
      return <BeerPaymentPane initialPersonId={pane.personId} />;
    case 'crates':
      return <BeerCratesPane initialPersonId={pane.personId} />;
    case 'settings':
      return <BeerSettingsPane />;
    case 'enrollments':
      return <BeerEnrollmentsPane />;
    case 'handover':
      return <BeerHandoverPane />;
    case 'code':
      return <BeerCodePane />;
    case 'pots':
      return <BeerPotsPane />;
    case 'person':
      return <BeerPersonPane personId={pane.personId} />;
    case 'closedPot':
      return <BeerClosedPotPane beerPotId={pane.beerPotId} />;
    default:
      return null;
  }
};

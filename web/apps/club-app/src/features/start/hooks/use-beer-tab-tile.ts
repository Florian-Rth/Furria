import type { KkStartTileReach } from '@furria/ui/reach';
import type { BeerTabLine } from '../beer-tab-tile';
import { beerTabLineOf, isBeerTabDue } from '../beer-tab-tile';
import type { StartPanelOf } from '../start-board';

export interface BeerTabTileView {
  attention: boolean;
  lines: BeerTabTileLine[];
}

export interface BeerTabTileLine {
  key: number;
  title: string;
  meta: string;
  reach: KkStartTileReach | undefined;
}

const META_SEPARATOR = ' · ';
const ONE_CRATE = 'Kiste';
const CRATES = 'Kisten';
const PAYPAL_TARGET = '_blank';
const PAYPAL_FEATURES = 'noopener';

const cratesLabelOf = (crates: number): string =>
  `${crates} ${crates === 1 ? ONE_CRATE : CRATES}`;

const metaOf = (line: BeerTabLine): string =>
  [
    cratesLabelOf(line.crates),
    line.ownerName === null ? null : `an ${line.ownerName}`,
    line.paymentNote,
  ]
    .filter((part): part is string => part !== null)
    .join(META_SEPARATOR);

const payReachOf = (line: BeerTabLine): KkStartTileReach | undefined => {
  const link = line.paymentLink;

  if (link === null) {
    return undefined;
  }

  return {
    label: `${line.amount} per PayPal bezahlen`,
    onClick: (): void => {
      window.open(link, PAYPAL_TARGET, PAYPAL_FEATURES);
    },
  };
};

export const useBeerTabTile = (panel: StartPanelOf<'beerTab'>, now: Date): BeerTabTileView => ({
  attention: isBeerTabDue(panel.beerTabs, now),
  lines: panel.beerTabs.map(beerTabLineOf).map((line) => ({
    key: line.key,
    title: `${line.amount} offen`,
    meta: metaOf(line),
    reach: payReachOf(line),
  })),
});

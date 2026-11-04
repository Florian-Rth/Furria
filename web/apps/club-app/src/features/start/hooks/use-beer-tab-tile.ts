import type { KkStartTileReach } from '@furria/ui/reach';
import type { BeerTabLine } from '../beer-tab-tile';
import { beerTabLineOf, isBeerTabDue } from '../beer-tab-tile';
import type { StartPanelOf } from '../start-board';

export interface BeerTabTileLine {
  key: number;
  title: string;
  meta: string;
  reach: KkStartTileReach | undefined;
}

export interface BeerTabTileView {
  attention: boolean;
  lines: BeerTabTileLine[];
}

const PAYPAL_TARGET = '_blank';
const PAYPAL_FEATURES = 'noopener';

const payReachOf = (line: BeerTabLine): KkStartTileReach | undefined => {
  const href = line.payHref;

  if (href === null) {
    return undefined;
  }

  return {
    label: line.payLabel,
    onClick: (): void => {
      window.open(href, PAYPAL_TARGET, PAYPAL_FEATURES);
    },
  };
};

const tileLineOf = (line: BeerTabLine): BeerTabTileLine => ({
  key: line.key,
  title: line.title,
  meta: line.meta,
  reach: payReachOf(line),
});

export const useBeerTabTile = (panel: StartPanelOf<'beerTab'>, now: Date): BeerTabTileView => ({
  attention: isBeerTabDue(panel.beerTabs, now),
  lines: panel.beerTabs.map(beerTabLineOf).map(tileLineOf),
});

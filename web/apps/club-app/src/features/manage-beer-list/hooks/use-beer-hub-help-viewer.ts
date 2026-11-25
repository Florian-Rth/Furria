import type { BeerHubHelpTopic } from '../beer-hub-help-topics';
import { beerHubHelpTopicsOf } from '../beer-hub-help-topics';
import type { BeerHub } from './use-beer-hub';

export interface BeerHubHelpViewer {
  topics: readonly BeerHubHelpTopic[];
  showsRoster: boolean;
}

const showsRosterOf = (hub: BeerHub): boolean => {
  if (hub.state.kind !== 'open') {
    return false;
  }

  return hub.isWide ? hub.pane === null : hub.state.open.openRoster.length > 0;
};

export const useBeerHubHelpViewer = (hub: BeerHub): BeerHubHelpViewer => ({
  topics: beerHubHelpTopicsOf(hub.state.kind !== 'empty', hub.pane),
  showsRoster: showsRosterOf(hub),
});

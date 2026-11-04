import type { FC } from 'react';
import { POTS_CONTEXT, POTS_TITLE } from '../beer-hub-copy';
import { BeerPaneFrame } from './BeerPaneFrame';
import { BeerPotsBody } from './BeerPotsBody';

export const BeerPotsPane: FC = () => (
  <BeerPaneFrame icon="archive" title={POTS_TITLE} context={POTS_CONTEXT}>
    <BeerPotsBody />
  </BeerPaneFrame>
);

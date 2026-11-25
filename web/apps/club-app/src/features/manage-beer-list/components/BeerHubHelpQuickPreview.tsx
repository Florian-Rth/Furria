import { KkPourQuickBar } from '@furria/ui/KkPourQuickBar';
import type { FC } from 'react';
import { QUICK_ITEMS, QUICK_LABEL } from '../beer-hub-copy';

const keep = (): void => {};

export const BeerHubHelpQuickPreview: FC = () => (
  <KkPourQuickBar label={QUICK_LABEL} items={QUICK_ITEMS} placement="top" onSelect={keep} />
);

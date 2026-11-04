import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkTabEntries } from '@furria/ui/KkTabEntries';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import {
  BEER_HUB_TITLE,
  ENTRIES_LABEL,
  ENTRY_CRATE_FOR,
  ENTRY_ENROLLMENTS,
  ENTRY_HANDOVER,
  ENTRY_SETTINGS,
  ENTRY_STOCK,
} from '../beer-a-copy';
import { queueCountsOf, queueOf, settledOf, stockViewOf } from '../beer-a-queue';
import { useBeerHubA } from '../hooks/use-beer-hub-a';
import type { BeerAHubViewer } from '../schemas';
import type { BeerALabChoice } from './BeerALabSwitch';
import { BeerALabSwitch } from './BeerALabSwitch';
import { BeerHubAQueue } from './BeerHubAQueue';
import { BeerHubASettled } from './BeerHubASettled';
import { BeerHubASide } from './BeerHubASide';
import { BeerHubASummary } from './BeerHubASummary';

interface BeerHubAPageProps {
  viewer: BeerAHubViewer;
  labChoices: readonly BeerALabChoice[];
  onLabChange: (choice: string) => void;
}

export const BeerHubAPage: FC<BeerHubAPageProps> = ({ viewer, labChoices, onLabChange }) => {
  const hub = useBeerHubA(viewer);
  const stock = stockViewOf(hub.world, hub.now);
  const counts = queueCountsOf(hub.world, hub.now);
  const rows = queueOf(hub.world, hub.now, hub.filter);
  const enrolledCount = hub.world.enrollments.filter((entry) => entry.endedAt === null).length;
  const entries = [
    {
      id: 'stock',
      icon: 'storefront' as const,
      label: ENTRY_STOCK,
      flag: String(stock.stock),
      attention: stock.warns,
    },
    {
      id: 'enrollments',
      icon: 'members' as const,
      label: ENTRY_ENROLLMENTS,
      flag: String(enrolledCount),
    },
    { id: 'crateFor', icon: 'add' as const, label: ENTRY_CRATE_FOR },
    { id: 'settings', icon: 'settings' as const, label: ENTRY_SETTINGS },
    { id: 'handover', icon: 'handshake' as const, label: ENTRY_HANDOVER },
  ];
  const selectedEntry =
    hub.selection === null || hub.selection.kind === 'payment' ? null : hub.selection.kind;
  const openPayment = (personId: number): void => {
    hub.select({ kind: 'payment', personId });
  };
  const openStock = (): void => {
    hub.select({ kind: 'stock' });
  };

  return (
    <KkScreen kind="detail" title={BEER_HUB_TITLE} origin={LAB_ORIGIN}>
      <KkPaneLayout>
        <KkPaneLayout.Main withPane={hub.isWide}>
          <BeerHubASummary counts={counts} filter={hub.filter} onFilter={hub.chooseFilter} />
          <BeerHubAQueue
            rows={rows}
            stock={stock}
            filter={hub.filter}
            now={hub.now}
            selection={hub.selection}
            onPay={openPayment}
            onStock={openStock}
          />
          <BeerHubASettled rows={settledOf(hub.world)} />
          <KkTabEntries
            label={ENTRIES_LABEL}
            items={entries}
            selected={selectedEntry}
            onSelect={hub.openPane}
          />
          <BeerALabSwitch choices={labChoices} value={viewer} onChange={onLabChange} />
        </KkPaneLayout.Main>
        <BeerHubASide hub={hub} stock={stock} />
      </KkPaneLayout>
    </KkScreen>
  );
};

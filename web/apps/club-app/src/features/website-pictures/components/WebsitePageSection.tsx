import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import type { SlotPositionRef } from '../types';
import type { BoardPage } from '../website-board';
import { WebsiteSlotRow } from './WebsiteSlotRow';

interface WebsitePageSectionProps {
  page: BoardPage;
  selected: SlotPositionRef | null;
  onSelect: (at: SlotPositionRef) => void;
}

export const WebsitePageSection: FC<WebsitePageSectionProps> = ({ page, selected, onSelect }) => {
  const rows = page.slots.map((slot) => (
    <WebsiteSlotRow
      key={slot.key}
      page={page.key}
      slot={slot}
      selected={selected}
      onSelect={onSelect}
    />
  ));

  return <KkPanelSection title={page.title}>{rows}</KkPanelSection>;
};

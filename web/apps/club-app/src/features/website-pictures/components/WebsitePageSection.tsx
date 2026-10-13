import { KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { SlotPositionRef } from '../types';
import type { BoardPage } from '../website-board';
import { pageMetaOf } from '../website-copy';
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
  const meta = pageMetaOf(page.path, page.filled, page.total);

  return (
    <KkPanelSection title={page.title} meta={meta}>
      {rows}
    </KkPanelSection>
  );
};

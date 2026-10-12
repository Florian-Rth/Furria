import { KkFilmEdge } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SlotPositionRef } from '../types';
import type { BoardPage } from '../website-board';
import { fillTrailOf, pageMetaOf } from '../website-copy';
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
  const meta = pageMetaOf(page.path);
  const trail = fillTrailOf(page.filled, page.total);

  return (
    <Stack component="section" aria-label={page.title} sx={{ minWidth: 0 }}>
      <KkFilmEdge lead={page.title} meta={meta} trail={trail} tone="red" size="title" level="h2" />
      {rows}
    </Stack>
  );
};

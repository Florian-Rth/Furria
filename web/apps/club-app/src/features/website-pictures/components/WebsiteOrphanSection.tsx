import { KkFilmEdge, KkSlotRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SlotPositionRef } from '../types';
import type { BoardPosition } from '../website-board';
import {
  aspectWordOf,
  ORPHANS_META,
  ORPHANS_TITLE,
  orphanNameOf,
  updatedLineOf,
} from '../website-copy';
import { positionFrameOf, selectedIndexOf } from '../website-frames';
import { editorNameOf } from '../website-people';

interface WebsiteOrphanSectionProps {
  orphans: readonly BoardPosition[];
  selected: SlotPositionRef | null;
  onSelect: (at: SlotPositionRef) => void;
}

export const WebsiteOrphanSection: FC<WebsiteOrphanSectionProps> = ({
  orphans,
  selected,
  onSelect,
}) => {
  if (orphans.length === 0) {
    return null;
  }

  const rows = orphans.map((orphan) => {
    const select = (): void => {
      onSelect({ slot: orphan.slot, position: orphan.position });
    };
    const updated =
      orphan.picture === null
        ? ''
        : ` · ${updatedLineOf(editorNameOf(orphan.picture.updatedBy), orphan.picture.updatedAt)}`;
    const facts = `${aspectWordOf(orphan.aspect)}${updated}`;
    const selectedIndex = selectedIndexOf([orphan], selected);
    const frames = [positionFrameOf(orphan)];
    const title = orphanNameOf(orphan.slot, orphan.position);
    return (
      <KkSlotRow
        key={`${orphan.slot}:${orphan.position}`}
        sketch={null}
        title={title}
        facts={facts}
        description={ORPHANS_META}
        positions={frames}
        selectedPosition={selectedIndex}
        onSelectPosition={select}
      />
    );
  });

  return (
    <Stack component="section" aria-label={ORPHANS_TITLE} sx={{ minWidth: 0 }}>
      <KkFilmEdge lead={ORPHANS_TITLE} tone="muted" size="title" level="h2" />
      {rows}
    </Stack>
  );
};

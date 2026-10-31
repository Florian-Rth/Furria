import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkRoster } from '@furria/ui/KkRoster';
import type { FC } from 'react';
import { FILTER_EMPTY, HELD_TITLE, ROSTER_LABEL } from '../board-hub-copy';
import type { BoardOffice } from '../schemas';
import { BoardRosterLine } from './BoardRosterLine';

interface BoardHeldProps {
  offices: readonly BoardOffice[];
  today: string;
  compact: boolean;
  selectedId: number | null;
  highlightedKey: string | null;
  onOpen: (boardOfficeId: number) => void;
}

export const BoardHeld: FC<BoardHeldProps> = ({
  offices,
  today,
  compact,
  selectedId,
  highlightedKey,
  onOpen,
}) => {
  const lines = offices.map((office) => (
    <BoardRosterLine
      highlightedKey={highlightedKey}
      key={office.boardOfficeId}
      office={office}
      today={today}
      compact={compact}
      selected={selectedId === office.boardOfficeId}
      onOpen={onOpen}
    />
  ));
  const list =
    lines.length === 0 ? (
      <KkMeta>{FILTER_EMPTY}</KkMeta>
    ) : (
      <KkRoster label={ROSTER_LABEL} compact={compact}>
        {lines}
      </KkRoster>
    );

  return <KkPanelSection title={HELD_TITLE}>{list}</KkPanelSection>;
};

import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { toVacantDescription, VACANT_TITLE } from '../manage-board-labels';
import { BoardSeatRow } from './BoardSeatRow';

const SECTION_TITLE = 'Sitze';
const ADD_TEXT = 'Sitz';
const ADD_ACTION_LABEL = 'Vorstandssitz eintragen';
const SEATS_NEW_ROUTE = '/manage/board/$boardOfficeId/seats/new';

interface BoardSeatsPanelProps {
  entry: BoardOfficeEntry;
  highlightedKey: string | null;
}

export const BoardSeatsPanel: FC<BoardSeatsPanelProps> = ({ entry, highlightedKey }) => {
  const action: KkPanelAction | undefined = entry.isArchived
    ? undefined
    : {
        label: ADD_TEXT,
        icon: 'add',
        ariaLabel: ADD_ACTION_LABEL,
        component: Link,
        to: SEATS_NEW_ROUTE,
        params: { boardOfficeId: String(entry.boardOfficeId) },
      };

  const body =
    entry.seats.length === 0 ? (
      <KkPanel variant="block" dimmed={entry.isArchived}>
        <KkEmptyState
          size="panel"
          title={VACANT_TITLE}
          description={toVacantDescription(entry.name)}
        />
      </KkPanel>
    ) : (
      <KkPanel variant="list">
        {entry.seats.map((seat) => (
          <BoardSeatRow
            key={seat.boardSeatId}
            boardOfficeId={entry.boardOfficeId}
            seat={seat}
            highlightedKey={highlightedKey}
          />
        ))}
      </KkPanel>
    );

  return (
    <KkPanelSection title={SECTION_TITLE} action={action}>
      {body}
    </KkPanelSection>
  );
};

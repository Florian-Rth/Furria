import type { KkPanelAction } from '@furria/ui';
import { KkPanelSection, KkPanelStack } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { BoardEmpty } from './BoardEmpty';
import { BoardOfficeSection } from './BoardOfficeSection';

const LIST_TITLE = 'Vorstandsfunktionen';
const ADD_TEXT = 'Funktion';
const ADD_ACTION_LABEL = 'Funktion hinzufügen';
const NEW_ROUTE = '/manage/board/new';

const ADD_ACTION: KkPanelAction = {
  label: ADD_TEXT,
  icon: 'add',
  ariaLabel: ADD_ACTION_LABEL,
  component: Link,
  to: NEW_ROUTE,
};

interface BoardViewProps {
  entries: readonly BoardOfficeEntry[];
}

export const BoardView: FC<BoardViewProps> = ({ entries }) => {
  const { highlightedKey } = useLanding();

  if (entries.length === 0) {
    return <BoardEmpty />;
  }

  return (
    <KkPanelSection title={LIST_TITLE} action={ADD_ACTION}>
      <KkPanelStack>
        {entries.map((entry) => (
          <BoardOfficeSection
            key={entry.boardOfficeId}
            entry={entry}
            highlightedKey={highlightedKey}
          />
        ))}
      </KkPanelStack>
    </KkPanelSection>
  );
};

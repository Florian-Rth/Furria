import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkSheet } from '@furria/ui/KkSheet';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePracticeSheet } from '../hooks/use-practice-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { START_PRACTICE_SHEET } from '../start-sheets';

const SHEET_TITLE = 'Was möchtest du üben?';
const CLOSE_LABEL = 'Schließen';

interface PracticeSheetProps {
  board: StartBoard;
}

export const PracticeSheet: FC<PracticeSheetProps> = ({ board }) => {
  const choices = usePracticeSheet(board);
  const rows = choices.map((choice) => (
    <KkHubRow
      key={choice.key}
      label={choice.label}
      icon="stage"
      meta={choice.meta}
      component={Link}
      to={choice.to}
      search={choice.search}
    />
  ));

  return (
    <KkSheet id={START_PRACTICE_SHEET} title={SHEET_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <KkPanel>{rows}</KkPanel>
      </KkSheet.Body>
    </KkSheet>
  );
};

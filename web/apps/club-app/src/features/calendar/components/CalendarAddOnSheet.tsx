import { KkPanel } from '@furria/ui/KkPanel';
import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import type { CalendarAddOnKind } from '../schemas';
import { CalendarAddOnOption } from './CalendarAddOnOption';

const SHEET_TITLE = 'Funktion hinzufügen';
const SHEET_CLOSE = 'Schließen';

interface CalendarAddOnSheetProps {
  sheetId: string;
  offered: readonly CalendarAddOnKind[];
  onAttach: (addOn: CalendarAddOnKind) => void;
}

export const CalendarAddOnSheet: FC<CalendarAddOnSheetProps> = ({ sheetId, offered, onAttach }) => {
  const options = offered.map((addOn) => (
    <CalendarAddOnOption key={addOn} addOn={addOn} onAttach={onAttach} />
  ));

  return (
    <KkSheet id={sheetId} title={SHEET_TITLE} closeLabel={SHEET_CLOSE}>
      <KkSheet.Body>
        <KkPanel variant="list">{options}</KkPanel>
      </KkSheet.Body>
    </KkSheet>
  );
};

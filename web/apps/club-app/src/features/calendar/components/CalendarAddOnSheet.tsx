import { KkPanel } from '@furria/ui/KkPanel';
import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import type { CalendarAddOnsControl } from '../hooks/use-calendar-add-ons';
import { ADD_ON_SHEET_ID } from '../hooks/use-calendar-add-ons';
import { CalendarAddOnOption } from './CalendarAddOnOption';

const SHEET_TITLE = 'Baustein hinzufügen';
const SHEET_CLOSE = 'Schließen';

interface CalendarAddOnSheetProps {
  addOns: CalendarAddOnsControl;
}

export const CalendarAddOnSheet: FC<CalendarAddOnSheetProps> = ({ addOns }) => {
  const options = addOns.offered.map((addOn) => (
    <CalendarAddOnOption key={addOn} addOn={addOn} onAttach={addOns.attach} />
  ));

  return (
    <KkSheet id={ADD_ON_SHEET_ID} title={SHEET_TITLE} closeLabel={SHEET_CLOSE}>
      <KkSheet.Body>
        <KkPanel variant="list">{options}</KkPanel>
      </KkSheet.Body>
    </KkSheet>
  );
};

import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useState } from 'react';
import { toDiscardedAnswerCount, toOfferedAddOns } from '../calendar-add-ons';
import type { CalendarEntry, CalendarEntryAddOn } from '../schemas';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

export const ADD_ON_SHEET_ID = 'calendar-add-on';

export interface CalendarAddOnRemoval {
  addOn: CalendarEntryAddOn;
  discardedAnswers: number;
}

const NO_REMOVAL: CalendarAddOnRemoval = { addOn: 'attendance', discardedAnswers: 0 };

export interface CalendarAddOnsControl {
  attached: readonly CalendarEntryAddOn[];
  offered: readonly CalendarEntryAddOn[];
  openSheet: () => void;
  attach: (addOn: CalendarEntryAddOn) => void;
  askRemoval: (addOn: CalendarEntryAddOn) => void;
  removal: CalendarAddOnRemoval;
  isRemovalOpen: boolean;
  confirmRemoval: () => void;
  cancelRemoval: () => void;
}

export const useCalendarAddOns = (
  control: CalendarEntryEditorControl,
  entry: CalendarEntry | null,
): CalendarAddOnsControl => {
  const sheets = useKkSheetCommands();
  const [removal, setRemoval] = useState<CalendarAddOnRemoval>(NO_REMOVAL);
  const [isRemovalOpen, setRemovalOpen] = useState(false);
  const attached = control.values.addOns;

  const askRemoval = (addOn: CalendarEntryAddOn): void => {
    const discardedAnswers = toDiscardedAnswerCount(addOn, entry);

    if (discardedAnswers === 0) {
      control.detachAddOn(addOn);
      return;
    }

    setRemoval({ addOn, discardedAnswers });
    setRemovalOpen(true);
  };

  return {
    attached,
    offered: toOfferedAddOns(attached),
    openSheet: () => {
      sheets.open(ADD_ON_SHEET_ID);
    },
    attach: (addOn) => {
      control.attachAddOn(addOn);
      sheets.close();
    },
    askRemoval,
    removal,
    isRemovalOpen,
    confirmRemoval: () => {
      control.detachAddOn(removal.addOn);
      setRemovalOpen(false);
    },
    cancelRemoval: () => {
      setRemovalOpen(false);
    },
  };
};

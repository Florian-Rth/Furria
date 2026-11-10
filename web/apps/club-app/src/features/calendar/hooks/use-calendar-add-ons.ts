import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useState } from 'react';
import { toDiscardedAnswerCount, toOfferedAddOns } from '../calendar-add-ons';
import type { CalendarAddOnCardForm, CalendarAddOnKind, CalendarEntry } from '../schemas';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

export const ADD_ON_SHEET_ID = 'calendar-add-on';

export interface CalendarAddOnRemoval {
  key: string;
  kind: CalendarAddOnKind;
  discardedAnswers: number;
}

const NO_REMOVAL: CalendarAddOnRemoval = { key: '', kind: 'attendance', discardedAnswers: 0 };

export interface CalendarAddOnsControl {
  attached: readonly CalendarAddOnCardForm[];
  offered: readonly CalendarAddOnKind[];
  openSheet: () => void;
  attach: (kind: CalendarAddOnKind) => void;
  askRemoval: (card: CalendarAddOnCardForm) => void;
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

  const askRemoval = (card: CalendarAddOnCardForm): void => {
    const discardedAnswers = toDiscardedAnswerCount(card, entry);

    if (discardedAnswers === 0) {
      control.detachAddOn(card.key);
      return;
    }

    setRemoval({ key: card.key, kind: card.kind, discardedAnswers });
    setRemovalOpen(true);
  };

  return {
    attached,
    offered: toOfferedAddOns(attached),
    openSheet: () => {
      sheets.open(ADD_ON_SHEET_ID);
    },
    attach: (kind) => {
      control.attachAddOn(kind);
      sheets.close();
    },
    askRemoval,
    removal,
    isRemovalOpen,
    confirmRemoval: () => {
      control.detachAddOn(removal.key);
      setRemovalOpen(false);
    },
    cancelRemoval: () => {
      setRemovalOpen(false);
    },
  };
};

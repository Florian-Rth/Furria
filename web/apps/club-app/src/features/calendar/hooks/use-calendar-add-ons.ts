import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useState } from 'react';
import type { CalendarAddOnKind } from '../schemas';

export interface CalendarAddOnRemoval {
  key: string;
  kind: CalendarAddOnKind;
  discardedAnswers: number;
}

export interface AddOnCardIdentity {
  key: string;
  kind: CalendarAddOnKind;
}

const NO_REMOVAL: CalendarAddOnRemoval = { key: '', kind: 'attendance', discardedAnswers: 0 };

export interface CalendarAddOnsInput<TCard extends AddOnCardIdentity> {
  sheetId: string;
  offered: readonly CalendarAddOnKind[];
  attach: (kind: CalendarAddOnKind) => void;
  detach: (key: string) => void;
  discardedAnswersOf: (card: TCard) => number;
}

export interface CalendarAddOnsControl<TCard extends AddOnCardIdentity> {
  sheetId: string;
  offered: readonly CalendarAddOnKind[];
  openSheet: () => void;
  attach: (kind: CalendarAddOnKind) => void;
  askRemoval: (card: TCard) => void;
  removal: CalendarAddOnRemoval;
  isRemovalOpen: boolean;
  confirmRemoval: () => void;
  cancelRemoval: () => void;
}

export const useCalendarAddOns = <TCard extends AddOnCardIdentity>({
  sheetId,
  offered,
  attach,
  detach,
  discardedAnswersOf,
}: CalendarAddOnsInput<TCard>): CalendarAddOnsControl<TCard> => {
  const sheets = useKkSheetCommands();
  const [removal, setRemoval] = useState<CalendarAddOnRemoval>(NO_REMOVAL);
  const [isRemovalOpen, setRemovalOpen] = useState(false);

  const askRemoval = (card: TCard): void => {
    const discardedAnswers = discardedAnswersOf(card);

    if (discardedAnswers === 0) {
      detach(card.key);
      return;
    }

    setRemoval({ key: card.key, kind: card.kind, discardedAnswers });
    setRemovalOpen(true);
  };

  return {
    sheetId,
    offered,
    openSheet: () => {
      sheets.open(sheetId);
    },
    attach: (kind) => {
      attach(kind);
      sheets.close();
    },
    askRemoval,
    removal,
    isRemovalOpen,
    confirmRemoval: () => {
      detach(removal.key);
      setRemovalOpen(false);
    },
    cancelRemoval: () => {
      setRemovalOpen(false);
    },
  };
};

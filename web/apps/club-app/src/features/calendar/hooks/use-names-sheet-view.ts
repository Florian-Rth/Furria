import type { KkNamesSheetTab } from '@furria/ui/KkNamesSheet';
import type { NameEntry, NamesTab } from '../calendar-names';
import {
  isNameSearchable,
  OPEN_TAB_ID,
  toCurrentTab,
  toNameMatches,
  toSheetOrder,
  toSheetTabs,
} from '../calendar-names';
import type { NamesSheetControl } from './use-names-sheet';

export interface NamesSheetView {
  tabs: KkNamesSheetTab[];
  tabId: string;
  hasTabs: boolean;
  listLabel: string;
  rows: NameEntry[];
  isSearchable: boolean;
  isNothingFound: boolean;
  isOpenTab: boolean;
}

export const useNamesSheetView = (
  tabs: readonly NamesTab[],
  sheet: NamesSheetControl,
): NamesSheetView | null => {
  const sheetTabs = toSheetTabs(tabs);
  const current = toCurrentTab(sheetTabs, sheet.tabId);

  if (current === null) {
    return null;
  }

  const isSearchable = isNameSearchable(current.entries.length);
  const ordered = toSheetOrder(current.entries);
  const rows = isSearchable ? toNameMatches(ordered, sheet.query) : ordered;

  return {
    tabs: sheetTabs.map(({ id, label, count, tone }) => ({ id, label, count, tone })),
    tabId: current.id,
    hasTabs: sheetTabs.length > 1,
    listLabel: current.label,
    rows,
    isSearchable,
    isNothingFound: rows.length === 0,
    isOpenTab: current.id === OPEN_TAB_ID,
  };
};

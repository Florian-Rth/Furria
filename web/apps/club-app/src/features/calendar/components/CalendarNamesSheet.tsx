import { KkNamesSheet } from '@furria/ui/KkNamesSheet';
import { KkSearchField } from '@furria/ui/KkSearchField';
import type { FC, ReactNode } from 'react';
import type { NamesTab } from '../calendar-names';
import type { NamesSheetControl } from '../hooks/use-names-sheet';
import { useNamesSheetView } from '../hooks/use-names-sheet-view';

const CLOSE_LABEL = 'Schließen';
const TABS_LABEL = 'Antworten';
const SEARCH_NAME = 'names-sheet-search';
const SEARCH_LABEL = 'Name suchen';
const CLEAR_LABEL = 'Suche leeren';
const NOTHING_FOUND_LABEL = 'Niemand gefunden';
const OWN_LABEL = '(du)';

interface CalendarNamesSheetProps {
  title: string;
  count?: string;
  tabs: readonly NamesTab[];
  sheet: NamesSheetControl;
  openAction?: ReactNode;
}

export const CalendarNamesSheet: FC<CalendarNamesSheetProps> = ({
  title,
  count,
  tabs,
  sheet,
  openAction = null,
}) => {
  const view = useNamesSheetView(tabs, sheet);

  if (view === null) {
    return null;
  }

  const tabBar = view.hasTabs ? (
    <KkNamesSheet.Tabs
      label={TABS_LABEL}
      tabs={view.tabs}
      value={view.tabId}
      onChange={sheet.select}
    />
  ) : null;
  const search = view.isSearchable ? (
    <KkSearchField
      name={SEARCH_NAME}
      label={SEARCH_LABEL}
      clearLabel={CLEAR_LABEL}
      value={sheet.query}
      onChange={sheet.setQuery}
    />
  ) : null;
  const titleCount = view.hasTabs ? undefined : count;
  const action = view.isOpenTab ? openAction : null;
  const rows = view.rows.map((row) => (
    <KkNamesSheet.Row
      key={row.key}
      name={row.name}
      note={row.note}
      text={row.text}
      own={row.isOwn}
      ownLabel={OWN_LABEL}
      removeLabel={row.removeLabel}
      onRemove={row.remove}
    />
  ));
  const nothingFound = view.isNothingFound ? (
    <KkNamesSheet.Empty text={NOTHING_FOUND_LABEL} />
  ) : null;

  return (
    <KkNamesSheet open={sheet.isOpen} label={title} closeLabel={CLOSE_LABEL} onClose={sheet.close}>
      <KkNamesSheet.Head>
        <KkNamesSheet.Title title={title} count={titleCount} />
        {tabBar}
        {action}
        {search}
      </KkNamesSheet.Head>
      <KkNamesSheet.List label={view.listLabel}>
        {rows}
        {nothingFound}
      </KkNamesSheet.List>
    </KkNamesSheet>
  );
};

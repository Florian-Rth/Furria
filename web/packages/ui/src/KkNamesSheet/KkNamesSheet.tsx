import { KkNamesSheetHead } from './internal/layout/KkNamesSheetHead';
import { KkNamesSheetList } from './internal/layout/KkNamesSheetList';
import { KkNamesSheetRoot } from './internal/layout/KkNamesSheetRoot';
import { KkNamesSheetEmpty } from './internal/ui/KkNamesSheetEmpty';
import { KkNamesSheetRow } from './internal/ui/KkNamesSheetRow';
import { KkNamesSheetTabs } from './internal/ui/KkNamesSheetTabs';
import { KkNamesSheetTitle } from './internal/ui/KkNamesSheetTitle';

export type { KkNamesSheetTab } from './internal/ui/KkNamesSheetTabs';

export const KkNamesSheet = Object.assign(KkNamesSheetRoot, {
  Head: KkNamesSheetHead,
  Title: KkNamesSheetTitle,
  Tabs: KkNamesSheetTabs,
  List: KkNamesSheetList,
  Row: KkNamesSheetRow,
  Empty: KkNamesSheetEmpty,
});

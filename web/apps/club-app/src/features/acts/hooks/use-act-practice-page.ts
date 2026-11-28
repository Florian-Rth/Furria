import type { ActScreen } from '../act-screens';
import { actScreenPathOf, switchedEditingOf } from '../act-screens';
import type { ActScreenSearch } from '../schemas';
import type { ActScreenPage } from './use-act-screen-page';
import { useActScreenPage } from './use-act-screen-page';

export interface ActPracticePage extends ActScreenPage {
  title: string;
  redirectPath: string | null;
  startEditing: boolean;
  toggleEditing: () => void;
}

export const useActPracticePage = (
  rawActId: string,
  editing: boolean,
  search: ActScreenSearch,
): ActPracticePage => {
  const page = useActScreenPage(rawActId, search, editing ? 'edit' : 'practice');
  const { actId, name } = page.load;
  const current: ActScreen = { kind: editing ? 'edit' : 'practice' };
  const practisePath = actId === null ? null : actScreenPathOf(actId, { kind: 'practice' });
  const redirectPath = page.access === 'practice' ? practisePath : null;

  return {
    ...page,
    title: name,
    redirectPath: page.access === 'hub' ? page.hubPath : redirectPath,
    startEditing: editing,
    toggleEditing: () => {
      page.swap(switchedEditingOf(current));
    },
  };
};

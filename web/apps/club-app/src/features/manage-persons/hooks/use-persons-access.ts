import { useNavigate, useSearch } from '@tanstack/react-router';
import type { PersonAccessFilter } from '../person-access-filter';
import { parsePersonAccessFilter } from '../person-access-filter';
import { nextAppFilter } from '../person-app-state';

const PERSONS_ROUTE_ID = '/_app/manage/persons';
const PERSONS_PATH = '/manage/persons';

export interface PersonsAccess {
  filter: PersonAccessFilter | null;
  choose: (id: string) => void;
  clear: () => void;
}

export const usePersonsAccess = (): PersonsAccess => {
  const search = useSearch({ from: PERSONS_ROUTE_ID });
  const navigate = useNavigate();
  const filter = parsePersonAccessFilter(search.access);

  const show = (next: PersonAccessFilter | null): void => {
    void navigate({
      to: PERSONS_PATH,
      search: (previous) => ({ ...previous, access: next ?? undefined }),
      replace: true,
      resetScroll: false,
    });
  };

  const choose = (id: string): void => {
    show(nextAppFilter(filter, id));
  };

  const clear = (): void => {
    show(null);
  };

  return { filter, choose, clear };
};

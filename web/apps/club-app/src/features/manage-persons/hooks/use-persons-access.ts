import { useNavigate, useSearch } from '@tanstack/react-router';
import type { PersonAccessFilter } from '../person-access-filter';
import { parsePersonAccessFilter } from '../person-access-filter';

const PERSONS_ROUTE_ID = '/_app/manage/persons';
const PERSONS_PATH = '/manage/persons';

export interface PersonsAccess {
  filter: PersonAccessFilter | null;
  clear: () => void;
}

export const usePersonsAccess = (): PersonsAccess => {
  const search = useSearch({ from: PERSONS_ROUTE_ID });
  const navigate = useNavigate();

  const clear = (): void => {
    void navigate({
      to: PERSONS_PATH,
      search: (previous) => ({ ...previous, access: undefined }),
      replace: true,
      resetScroll: false,
    });
  };

  return { filter: parsePersonAccessFilter(search.access), clear };
};

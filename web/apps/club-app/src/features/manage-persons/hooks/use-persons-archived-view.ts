import { useNavigate, useSearch } from '@tanstack/react-router';

const PERSONS_ROUTE_ID = '/_app/manage/persons';
const PERSONS_PATH = '/manage/persons';

export interface PersonsArchivedView {
  isArchived: boolean;
  show: (archived: boolean) => void;
}

export const usePersonsArchivedView = (): PersonsArchivedView => {
  const search = useSearch({ from: PERSONS_ROUTE_ID });
  const navigate = useNavigate();

  const show = (archived: boolean): void => {
    void navigate({
      to: PERSONS_PATH,
      search: (previous) => ({ ...previous, archived: archived ? true : undefined }),
      replace: true,
      resetScroll: false,
    });
  };

  return { isArchived: search.archived === true, show };
};

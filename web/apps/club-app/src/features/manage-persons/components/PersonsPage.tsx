import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MORE_ORIGIN, RequirePermission, useScreenSearch } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonsQuery } from '../api';
import { PERSONS_TITLE, toPersonsLead } from '../manage-persons-labels';
import { PersonsBody } from './PersonsBody';

const SEARCH_PLACEHOLDER = 'Name, Adresse, E-Mail';

export const PersonsPage: FC = () => {
  const search = useScreenSearch(SEARCH_PLACEHOLDER);
  const persons = usePersonsQuery();
  const lead = persons.data === undefined ? undefined : toPersonsLead(persons.data.persons.length);

  return (
    <KkScreen
      kind="list"
      search={search}
      title={PERSONS_TITLE}
      origin={MORE_ORIGIN}
      header={<KkTitleHeader title={PERSONS_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
        <PersonsBody />
      </RequirePermission>
    </KkScreen>
  );
};

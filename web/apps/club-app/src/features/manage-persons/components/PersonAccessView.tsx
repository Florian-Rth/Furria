import { KkPanelStack } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { AccessPanel } from '@/features/account-access';
import { useLanding } from '@/features/write';
import { useRefreshPerson } from '../api';
import type { PersonDetails } from '../schemas';

interface PersonAccessViewProps {
  person: PersonDetails;
  deletionLine: ReactNode;
}

export const PersonAccessView: FC<PersonAccessViewProps> = ({ person, deletionLine }) => {
  const { highlightedKey } = useLanding();
  const refreshPerson = useRefreshPerson(person.personId);

  return (
    <KkPanelStack>
      <AccessPanel subject={person} highlightedKey={highlightedKey} onChanged={refreshPerson} />
      {deletionLine}
    </KkPanelStack>
  );
};

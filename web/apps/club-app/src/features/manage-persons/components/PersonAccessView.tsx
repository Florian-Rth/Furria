import { KkPanelStack } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { AccessPanel } from '@/features/account-access';
import { useLanding } from '@/features/write';
import type { PersonDetails } from '../schemas';
import { PersonStateRail } from './PersonStateRail';

interface PersonAccessViewProps {
  person: PersonDetails;
  deletionLine: ReactNode;
}

export const PersonAccessView: FC<PersonAccessViewProps> = ({ person, deletionLine }) => {
  const { highlightedKey } = useLanding();

  return (
    <KkPanelStack>
      <PersonStateRail person={person} />
      <AccessPanel subject={person} highlightedKey={highlightedKey} />
      {deletionLine}
    </KkPanelStack>
  );
};

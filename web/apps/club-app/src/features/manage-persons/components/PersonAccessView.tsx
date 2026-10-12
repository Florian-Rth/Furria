import { KkPanelStack } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { AccessPanel } from '@/features/account-access';
import { useLanding } from '@/features/write';
import type { PersonDetails } from '../schemas';

interface PersonAccessViewProps {
  person: PersonDetails;
  deletionLine: ReactNode;
}

export const PersonAccessView: FC<PersonAccessViewProps> = ({ person, deletionLine }) => {
  const { highlightedKey } = useLanding();

  return (
    <KkPanelStack>
      <AccessPanel subject={person} highlightedKey={highlightedKey} />
      {deletionLine}
    </KkPanelStack>
  );
};

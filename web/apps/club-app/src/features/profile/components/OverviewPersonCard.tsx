import type { FC } from 'react';
import type { Person } from '@/lib/api/schemas';
import { OverviewCard } from './OverviewCard';
import { OverviewField } from './OverviewField';
import { OverviewFields } from './OverviewFields';

const EMPTY_VALUE = 'Nicht hinterlegt';

interface OverviewPersonCardProps {
  person: Person;
}

export const OverviewPersonCard: FC<OverviewPersonCardProps> = ({ person }) => {
  const fullName = `${person.firstName} ${person.lastName}`;
  const contactEmail = person.email ?? EMPTY_VALUE;
  const phone = person.phone ?? EMPTY_VALUE;

  return (
    <OverviewCard title="Person">
      <OverviewFields>
        <OverviewField label="Name" value={fullName} />
        <OverviewField label="Kontakt-E-Mail" value={contactEmail} />
        <OverviewField label="Telefon" value={phone} />
      </OverviewFields>
    </OverviewCard>
  );
};

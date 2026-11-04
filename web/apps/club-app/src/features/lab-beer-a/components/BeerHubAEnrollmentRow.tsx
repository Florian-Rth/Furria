import { KkButton } from '@furria/ui/KkButton';
import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import type { LabBeerPerson } from '@/features/lab-beer/beer-lab-types';
import { END_ACTION } from '../beer-a-copy';
import { nameOf } from '../beer-a-format';

interface BeerHubAEnrollmentRowProps {
  person: LabBeerPerson | null;
  personId: number;
  count: string;
  day: string;
  onEnd: ((personId: number) => void) | null;
}

export const BeerHubAEnrollmentRow: FC<BeerHubAEnrollmentRowProps> = ({
  person,
  personId,
  count,
  day,
  onEnd,
}) => {
  const end = (): void => {
    onEnd?.(personId);
  };
  const action =
    onEnd === null ? null : (
      <KkButton variant="text" tone="danger" size="small" onClick={end}>
        {END_ACTION}
      </KkButton>
    );

  return (
    <KkTabLedger.Person
      initials={person?.initials ?? ''}
      name={nameOf(person)}
      count={count}
      day={day}
      action={action}
    />
  );
};

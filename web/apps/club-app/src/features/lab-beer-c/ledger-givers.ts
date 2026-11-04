import { giversOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerCrate, LabBeerPerson } from '@/features/lab-beer/beer-lab-types';

export interface GiverLine {
  person: LabBeerPerson;
  crateCount: number;
  lastAt: string;
}

export const giverLinesOf = (
  crates: readonly LabBeerCrate[],
  persons: readonly LabBeerPerson[],
): readonly GiverLine[] =>
  giversOf(crates)
    .flatMap((giver) => {
      const person = persons.find((candidate) => candidate.id === giver.personId);

      return person === undefined
        ? []
        : [{ person, crateCount: giver.crateCount, lastAt: giver.lastAt }];
    })
    .sort((left, right) =>
      `${left.person.lastName} ${left.person.firstName}`.localeCompare(
        `${right.person.lastName} ${right.person.firstName}`,
        'de',
      ),
    );

import { formatIsoDay } from '@/lib/membership-labels';
import { toInitials } from './initials';

export const KEY_HOLDER_SINCE_LABEL = 'Inhaber seit';

const NO_KEY_HOLDER_LINE = 'niemand hat einen Schlüssel';

interface KeyHolderPerson {
  personId: number;
  firstName: string;
  lastName: string;
}

interface KeyHolding {
  person: KeyHolderPerson;
  sinceOn: string;
}

export interface KeyHolderEntry {
  personId: number;
  name: string;
  initials: string;
  sinceValue: string;
}

export interface KeyVenueSummary {
  initials: string[];
  holderCount: number;
  emptyLine: string | null;
}

const toName = (person: KeyHolderPerson): string => `${person.firstName} ${person.lastName}`;

export const toKeyHolderEntries = (holdings: readonly KeyHolding[]): KeyHolderEntry[] =>
  holdings.map((holding) => ({
    personId: holding.person.personId,
    name: toName(holding.person),
    initials: toInitials(holding.person.firstName, holding.person.lastName),
    sinceValue: formatIsoDay(holding.sinceOn),
  }));

export const toKeyVenueSummary = (holdings: readonly KeyHolding[]): KeyVenueSummary => {
  const initials = holdings.map((holding) =>
    toInitials(holding.person.firstName, holding.person.lastName),
  );

  return {
    initials,
    holderCount: initials.length,
    emptyLine: initials.length === 0 ? NO_KEY_HOLDER_LINE : null,
  };
};

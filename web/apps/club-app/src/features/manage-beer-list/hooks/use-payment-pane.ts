import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { BeerRosterRow } from '../beer-hub';
import { openCratesOf } from '../beer-hub';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { personOptionLabelOf } from '../beer-hub-copy';
import type { PaymentTarget } from './use-payment-form';
import type { PersonPick } from './use-person-pick';
import { usePersonPick } from './use-person-pick';

const NO_ROWS: readonly BeerRosterRow[] = [];

export interface PaymentPane {
  hasOpenTabs: boolean;
  pick: PersonPick;
  options: readonly KkSelectOption[];
  target: PaymentTarget | null;
  targetKey: string;
}

export const usePaymentPane = (initialPersonId: number | null): PaymentPane => {
  const open = openHubOf(useBeerHubContext());
  const openRows = open?.roster.filter((row) => row.openCrates > 0) ?? NO_ROWS;
  const pick = usePersonPick(
    initialPersonId ?? openRows[0]?.person.personId ?? null,
    openRows.map((row) => row.person.personId),
  );
  const picked = openRows.find((row) => row.person.personId === pick.personId) ?? null;
  const target =
    picked === null || open === null
      ? null
      : {
          beerPotId: open.pot.beerPotId,
          person: picked.person,
          oldestFirst: openCratesOf(open.crates, picked.person.personId),
        };

  return {
    hasOpenTabs: openRows.length > 0,
    pick,
    options: openRows.map((row) => ({
      value: String(row.person.personId),
      label: personOptionLabelOf(row),
    })),
    target,
    targetKey: `${target?.person.personId ?? 0}-${target?.oldestFirst.length ?? 0}`,
  };
};

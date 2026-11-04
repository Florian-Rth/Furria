import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import type { BeerBookable } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import {
  COUNT_FIELD_LABEL,
  crateButtonOf,
  firstNameOf,
  fullNameOf,
  PAID_SWITCH_HINT,
  PAID_SWITCH_LABEL,
  PERSON_LABEL,
  STEP_LABELS,
  stockAfterOf,
} from '../beer-hub-copy';
import { useCratesForm } from '../hooks/use-crates-form';

const ENDED_SUFFIX = ' · Teilnahme beendet';

interface BeerCratesFormProps {
  beerPotId: number;
  bookable: readonly BeerBookable[];
  initialPersonId: number | null;
  stock: number;
}

export const BeerCratesForm: FC<BeerCratesFormProps> = ({
  beerPotId,
  bookable,
  initialPersonId,
  stock,
}) => {
  const hub = useBeerHubContext();
  const form = useCratesForm({
    beerPotId,
    candidates: bookable.map((entry) => entry.person),
    initialPersonId,
    stock,
    onDone: hub.closePane,
  });
  const options = bookable.map((entry) => ({
    value: String(entry.person.personId),
    label: `${fullNameOf(entry.person)}${entry.enrolled ? '' : ENDED_SUFFIX}`,
  }));
  const buttonLabel = crateButtonOf(form.count, firstNameOf(form.person), form.paid);
  const hint = stockAfterOf(stock, -form.count);

  return (
    <>
      <KkSelectField
        name="person"
        label={PERSON_LABEL}
        value={form.pick.value}
        options={options}
        presentation="select"
        onChange={form.pick.choose}
      />
      <KkNumberField
        name="crates"
        label={COUNT_FIELD_LABEL}
        value={form.countText}
        onChange={form.setCountText}
        stepLabels={STEP_LABELS}
        min={1}
        max={form.maxCount}
        hint={hint}
      />
      <KkSwitchRow
        label={PAID_SWITCH_LABEL}
        description={PAID_SWITCH_HINT}
        checked={form.paid}
        onChange={form.setPaid}
      />
      <KkButton variant="contained" size="large" disabled={!form.canSubmit} onClick={form.submit}>
        {buttonLabel}
      </KkButton>
    </>
  );
};

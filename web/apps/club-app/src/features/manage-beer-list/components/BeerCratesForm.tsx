import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import type { WriteLanding } from '@/features/write/landing-target';
import type { BeerBookable } from '../beer-hub';
import {
  bookableLabelOf,
  COUNT_FIELD_LABEL,
  crateButtonOf,
  firstNameOf,
  PAID_SWITCH_HINT,
  PAID_SWITCH_LABEL,
  PERSON_LABEL,
  STEP_LABELS,
  stockAfterOf,
} from '../beer-hub-copy';
import { useCratesForm } from '../hooks/use-crates-form';
import { BeerRejection } from './BeerRejection';

interface BeerCratesFormProps {
  beerPotId: number;
  bookable: readonly BeerBookable[];
  initialPersonId: number | null;
  stock: number;
  landing: WriteLanding;
}

const optionOf = (entry: BeerBookable): { value: string; label: string } => ({
  value: String(entry.person.personId),
  label: bookableLabelOf(entry),
});

const personOf = (entry: BeerBookable): BeerBookable['person'] => entry.person;

export const BeerCratesForm: FC<BeerCratesFormProps> = ({
  beerPotId,
  bookable,
  initialPersonId,
  stock,
  landing,
}) => {
  const form = useCratesForm({
    beerPotId,
    candidates: bookable.map(personOf),
    initialPersonId,
    stock,
    landing,
  });
  const options = bookable.map(optionOf);
  const buttonLabel = crateButtonOf(
    form.count,
    form.person === null ? null : firstNameOf(form.person),
    form.paid,
  );
  const hint = stockAfterOf(stock, -form.count);
  const personInvalid = form.personError !== undefined;
  const countInvalid = form.countError !== undefined;

  return (
    <>
      <KkSelectField
        name="personId"
        label={PERSON_LABEL}
        value={form.personValue}
        options={options}
        presentation="select"
        onChange={form.choosePerson}
        error={personInvalid}
        helperText={form.personError}
      />
      <KkNumberField
        name="count"
        label={COUNT_FIELD_LABEL}
        value={form.countText}
        onChange={form.setCountText}
        stepLabels={STEP_LABELS}
        min={1}
        max={form.maxCount}
        hint={hint}
        error={countInvalid}
        helperText={form.countError}
      />
      <KkSwitchRow
        label={PAID_SWITCH_LABEL}
        description={PAID_SWITCH_HINT}
        checked={form.paid}
        onChange={form.setPaid}
      />
      <BeerRejection rejection={form.rejection} />
      <KkButton
        variant="contained"
        size="large"
        disabled={!form.canSubmit}
        loading={form.isSaving}
        onClick={form.submit}
      >
        {buttonLabel}
      </KkButton>
    </>
  );
};

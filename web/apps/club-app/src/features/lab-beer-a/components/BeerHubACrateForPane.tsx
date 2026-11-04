import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTabCount } from '@furria/ui/KkTabCount';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { countChoicesOf } from '../beer-a-access';
import {
  bookLabel,
  COUNT_LABEL,
  CRATE_FOR_NOTE,
  CRATE_FOR_PERSON,
  countOptionLabel,
  crateForBook,
  crateForDone,
  REFUSALS,
  UNDO_LABEL,
} from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import { useCrateFor } from '../hooks/use-crate-for';

interface BeerHubACrateForPaneProps {
  world: LabBeerWorld;
  stock: number;
  bookFor: (personId: number, count: number) => readonly number[] | LabBeerRefusal;
  undo: (crateIds: readonly number[]) => LabBeerRefusal | null;
}

export const BeerHubACrateForPane: FC<BeerHubACrateForPaneProps> = ({
  world,
  stock,
  bookFor,
  undo,
}) => {
  const form = useCrateFor(bookFor, undo);
  const options = world.enrollments
    .filter((enrollment) => enrollment.endedAt === null)
    .map((enrollment) => ({
      value: String(enrollment.personId),
      label: nameOf(labBeerPersonOf(enrollment.personId)),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const counts = countChoicesOf(stock).map((choice) => ({
    value: choice.value,
    label: countOptionLabel(choice.value),
    disabled: choice.disabled,
  }));
  const chosenName = nameOf(
    form.personText === '' ? null : labBeerPersonOf(Number(form.personText)),
  );
  const bookText = chosenName === '' ? bookLabel(form.count) : crateForBook(form.count, chosenName);
  const undoIcon = <KkIcon name="undo" size="small" />;
  const bookedText =
    form.booked === null
      ? ''
      : crateForDone(form.booked.crateIds.length, nameOf(labBeerPersonOf(form.booked.personId)));
  const booked =
    form.booked === null ? null : (
      <KkAlert severity="success">
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {bookedText}
          <KkButton variant="text" size="small" startIcon={undoIcon} onClick={form.undo}>
            {UNDO_LABEL}
          </KkButton>
        </Stack>
      </KkAlert>
    );
  const refusal =
    form.refusal === null ? null : <KkAlert severity="warning">{REFUSALS[form.refusal]}</KkAlert>;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkSelectField
        name="crate-for"
        label={CRATE_FOR_PERSON}
        value={form.personText}
        options={options}
        onChange={form.choosePerson}
      />
      <KkTabCount
        label={COUNT_LABEL}
        options={counts}
        value={form.count}
        onChange={form.chooseCount}
      />
      <KkButton fullWidth disabled={form.personText === ''} onClick={form.book}>
        {bookText}
      </KkButton>
      <KkMeta>{CRATE_FOR_NOTE}</KkMeta>
      {booked}
      {refusal}
    </Stack>
  );
};

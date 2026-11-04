import { KkButton } from '@furria/ui/KkButton';
import { KkFilterChips } from '@furria/ui/KkFilterChips';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkSelectField } from '@furria/ui/KkSelectField';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerBookable, BeerKindFilter } from '../beer-hub';
import { bookableOf } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import {
  clearPersonLabelOf,
  firstNameOf,
  fullNameOf,
  KIND_FILTER_LABEL,
  KIND_LABELS,
  KIND_ORDER,
  PERSON_FILTER_ALL,
  PERSON_FILTER_LABEL,
} from '../beer-hub-copy';

const ALL_PERSONS = 'all';

const CLEAR_ICON = <KkIcon name="close" size="small" />;

const KIND_OPTIONS = KIND_ORDER.map((kind) => ({ id: kind, label: KIND_LABELS[kind] }));

const optionOf = (entry: BeerBookable): { value: string; label: string } => ({
  value: String(entry.person.personId),
  label: fullNameOf(entry.person),
});

const isKind = (id: string): id is BeerKindFilter => KIND_ORDER.some((kind) => kind === id);

export const BeerHubFilters: FC = () => {
  const hub = useBeerHubContext();
  const bookable = bookableOf(hub.enrollments);
  const personOptions = [
    { value: ALL_PERSONS, label: PERSON_FILTER_ALL },
    ...bookable.map(optionOf),
  ];
  const personValue = hub.personFilter === null ? ALL_PERSONS : String(hub.personFilter);
  const filtered =
    bookable.find((entry) => entry.person.personId === hub.personFilter)?.person ?? null;
  const chooseKind = (id: string): void => {
    if (isKind(id)) {
      hub.chooseKind(id);
    }
  };
  const choosePerson = (value: string): void => {
    hub.choosePerson(value === ALL_PERSONS ? null : Number(value));
  };
  const clearPerson = (): void => {
    hub.choosePerson(null);
  };
  const clearLabel = clearPersonLabelOf(firstNameOf(filtered));
  const clear =
    hub.personFilter === null ? null : (
      <KkButton variant="text" size="small" startIcon={CLEAR_ICON} onClick={clearPerson}>
        {clearLabel}
      </KkButton>
    );

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0, alignItems: 'flex-start' }}>
      <Grid container spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <KkFilterChips
            label={KIND_FILTER_LABEL}
            options={KIND_OPTIONS}
            value={hub.kind}
            onChange={chooseKind}
          />
        </Grid>
        <Grid size={{ md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <KkSelectField
            name="person"
            label={PERSON_FILTER_LABEL}
            value={personValue}
            options={personOptions}
            presentation="select"
            onChange={choosePerson}
          />
        </Grid>
      </Grid>
      {clear}
    </Stack>
  );
};

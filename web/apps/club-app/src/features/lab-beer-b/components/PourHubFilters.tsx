import { KkButton } from '@furria/ui/KkButton';
import { KkFilterChips } from '@furria/ui/KkFilterChips';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkSelectField } from '@furria/ui/KkSelectField';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { PourHub } from '../hooks/use-pour-hub';
import { fullNameOf } from '../pour-copy';
import {
  clearPersonLabelOf,
  KIND_FILTER_LABEL,
  KIND_LABELS,
  KIND_ORDER,
  nameOf,
  PERSON_FILTER_ALL,
  PERSON_FILTER_LABEL,
} from '../pour-hub-copy';
import type { PourKindFilter } from '../pour-journal';

const ALL_PERSONS = 'all';

const CLEAR_ICON = <KkIcon name="close" size="small" />;

const isKind = (id: string): id is PourKindFilter => KIND_ORDER.some((kind) => kind === id);

interface PourHubFiltersProps {
  hub: PourHub;
}

export const PourHubFilters: FC<PourHubFiltersProps> = ({ hub }) => {
  const kindOptions = KIND_ORDER.map((kind) => ({
    id: kind,
    label: KIND_LABELS[kind],
  }));
  const personOptions = [
    { value: ALL_PERSONS, label: PERSON_FILTER_ALL },
    ...hub.roster.map((row) => ({
      value: String(row.personId),
      label: fullNameOf(labBeerPersonOf(row.personId)),
    })),
  ];
  const personValue = hub.personFilter === null ? ALL_PERSONS : String(hub.personFilter);
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
  const clearLabel = clearPersonLabelOf(nameOf(hub.personFilter));
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
            options={kindOptions}
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

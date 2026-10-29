import { KkButton } from '@furria/ui/KkButton';
import { KkChipField } from '@furria/ui/KkChipField';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkMultiSelectField } from '@furria/ui/KkMultiSelectField';
import { KkPriceField } from '@furria/ui/KkPriceField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { EventEditorControl } from '../hooks/use-event-editor';
import { EVENT_AGE_HINT_MAX_LENGTH } from '../schemas';

const SECTION_TITLE = 'Karten';
const PRICE_LABEL = 'Preis pro Karte';
const PRICE_PLACEHOLDER = 'offen';
const PRESALE_DAY_LABEL = 'Vorverkauf ab';
const PRESALE_DAY_EMPTY_LABEL = 'Noch nicht festgelegt';
const PRESALE_TIME_LABEL = 'Uhrzeit';
const PRESALE_HINT = 'Bis dahin zählt die Website die Tage bis zum Start herunter.';
const PRESALE_QUICK_TIMES = ['10:00', '11:11'] as const;
const PRESALE_PLACES_LABEL = 'Vorverkaufsstellen';
const PRESALE_PLACES_HINT =
  'Wo es Karten gibt. Die Website zeigt die Stellen mit ihren Öffnungszeiten in der Reihenfolge, in der du sie antippst.';
const PRESALE_PLACES_EMPTY = 'Noch kein Ort eingetragen.';
const NEW_VENUE_LABEL = 'Ort anlegen';
const NEW_VENUE_ROUTE = '/manage/venues/new';
const NEW_VENUE_ICON = <KkIcon name="add" size="small" />;
const AGE_HINT_LABEL = 'Altershinweis';
const AGE_HINT_SUGGESTIONS = ['Ab 16 Jahren', 'Ab 18 Jahren'] as const;

const NO_DAY = '';

interface EventTicketsSectionProps {
  control: EventEditorControl;
  presalePlaceOptions: readonly KkSelectOption[];
}

export const EventTicketsSection: FC<EventTicketsSectionProps> = ({
  control,
  presalePlaceOptions,
}) => {
  const permissions = usePermissions();
  const errors = control.form.formState.errors;
  const priceErrorText = errors.price?.message;
  const ageHintErrorText = errors.ageHint?.message;
  const hasPresaleError = errors.presaleTime !== undefined;
  const presaleHelperText = errors.presaleTime?.message ?? PRESALE_HINT;
  const hasNoPresale = control.values.presaleDay === NO_DAY;
  const presalePlacesErrorText = errors.presaleVenueIds?.message;
  const pickedPresalePlaces = control.values.presaleVenueIds.map(String);
  const newVenue = permissions.has(PERMISSION_KEYS.clubManage) ? (
    <Stack direction="row">
      <KkButton
        variant="text"
        size="small"
        startIcon={NEW_VENUE_ICON}
        component={Link}
        to={NEW_VENUE_ROUTE}
      >
        {NEW_VENUE_LABEL}
      </KkButton>
    </Stack>
  ) : null;

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkPriceField
        name="price"
        label={PRICE_LABEL}
        value={control.values.price}
        onChange={control.setPrice}
        placeholder={PRICE_PLACEHOLDER}
        error={priceErrorText !== undefined}
        helperText={priceErrorText}
      />
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name="presaleDay"
            label={PRESALE_DAY_LABEL}
            value={control.values.presaleDay}
            onChange={control.setPresaleDay}
            allowEmpty
            emptyLabel={PRESALE_DAY_EMPTY_LABEL}
          />
        }
        end={
          <KkTimeField
            name="presaleTime"
            label={PRESALE_TIME_LABEL}
            value={control.values.presaleTime}
            onChange={control.setPresaleTime}
            quickTimes={PRESALE_QUICK_TIMES}
            disabled={hasNoPresale}
            error={hasPresaleError}
            helperText={presaleHelperText}
          />
        }
      />
      <KkMultiSelectField
        name="presaleVenueIds"
        label={PRESALE_PLACES_LABEL}
        values={pickedPresalePlaces}
        options={presalePlaceOptions}
        onToggle={control.togglePresaleVenue}
        emptyLabel={PRESALE_PLACES_EMPTY}
        hint={PRESALE_PLACES_HINT}
        error={presalePlacesErrorText !== undefined}
        helperText={presalePlacesErrorText}
      />
      {newVenue}
      <KkChipField
        name="ageHint"
        label={AGE_HINT_LABEL}
        value={control.values.ageHint}
        onChange={control.setAgeHint}
        suggestions={AGE_HINT_SUGGESTIONS}
        maxLength={EVENT_AGE_HINT_MAX_LENGTH}
        error={ageHintErrorText !== undefined}
        helperText={ageHintErrorText}
      />
    </KkFormSection>
  );
};

import {
  KkChipField,
  KkDateField,
  KkFormPair,
  KkFormSection,
  KkPriceField,
  KkTimeField,
} from '@furria/ui';
import type { FC } from 'react';
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
const AGE_HINT_LABEL = 'Altershinweis';
const AGE_HINT_SUGGESTIONS = ['Ab 16 Jahren', 'Ab 18 Jahren'] as const;

const NO_DAY = '';

interface EventTicketsSectionProps {
  control: EventEditorControl;
}

export const EventTicketsSection: FC<EventTicketsSectionProps> = ({ control }) => {
  const errors = control.form.formState.errors;
  const priceErrorText = errors.price?.message;
  const ageHintErrorText = errors.ageHint?.message;
  const hasPresaleError = errors.presaleTime !== undefined;
  const presaleHelperText = errors.presaleTime?.message ?? PRESALE_HINT;
  const hasNoPresale = control.values.presaleDay === NO_DAY;

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

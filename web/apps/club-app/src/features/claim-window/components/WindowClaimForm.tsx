import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextField } from '@furria/ui/KkTextField';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { WindowClaimFailure } from '../claim-failure';
import {
  BIRTH_DATE_TITLE,
  CLAIM_FAILURES,
  CLAIM_INTRO,
  CLAIM_SUBMIT_LABEL,
  CLAIM_TITLE,
  DAY_LABEL,
  FIRST_NAME_LABEL,
  LAST_NAME_LABEL,
  MONTH_LABEL,
  YEAR_LABEL,
} from '../claim-window-copy';
import type { WindowClaimForm as WindowClaimValues } from '../schemas';

const DAY_SPAN = 3;
const YEAR_SPAN = 6;
const DAY_DIGITS = 2;
const YEAR_DIGITS = 4;

interface WindowClaimFormProps {
  form: UseFormReturn<WindowClaimValues>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isClaiming: boolean;
  failure: WindowClaimFailure | null;
}

export const WindowClaimForm: FC<WindowClaimFormProps> = ({
  form,
  onSubmit,
  isClaiming,
  failure,
}) => {
  const errors = form.formState.errors;
  const firstName = form.register('firstName');
  const lastName = form.register('lastName');
  const day = form.register('day');
  const month = form.register('month');
  const year = form.register('year');
  const birthDateError = errors.day?.message;
  const hasBirthDateError = birthDateError !== undefined;
  const failureAlert = failure === null ? null : <KkAlert>{CLAIM_FAILURES[failure]}</KkAlert>;
  const birthDateNote = hasBirthDateError ? <KkNote tone="warning">{birthDateError}</KkNote> : null;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {CLAIM_TITLE}
        </KkHeading>
        <KkNote>{CLAIM_INTRO}</KkNote>
      </Stack>
      <Stack component="form" noValidate onSubmit={onSubmit} sx={{ gap: 2.5 }}>
        <KkTextField
          name={firstName.name}
          label={FIRST_NAME_LABEL}
          autoComplete="given-name"
          required
          error={errors.firstName !== undefined}
          helperText={errors.firstName?.message}
          onChange={firstName.onChange}
          onBlur={firstName.onBlur}
          inputRef={firstName.ref}
        />
        <KkTextField
          name={lastName.name}
          label={LAST_NAME_LABEL}
          autoComplete="family-name"
          required
          error={errors.lastName !== undefined}
          helperText={errors.lastName?.message}
          onChange={lastName.onChange}
          onBlur={lastName.onBlur}
          inputRef={lastName.ref}
        />
        <Stack role="group" aria-label={BIRTH_DATE_TITLE} sx={{ gap: 1, minWidth: 0 }}>
          <KkHeading level={3} component="p">
            {BIRTH_DATE_TITLE}
          </KkHeading>
          <Grid container columnSpacing={1.5} sx={{ minWidth: 0 }}>
            <Grid size={DAY_SPAN}>
              <KkTextField
                name={day.name}
                label={DAY_LABEL}
                inputMode="numeric"
                autoComplete="bday-day"
                maxLength={DAY_DIGITS}
                error={hasBirthDateError}
                onChange={day.onChange}
                onBlur={day.onBlur}
                inputRef={day.ref}
              />
            </Grid>
            <Grid size={DAY_SPAN}>
              <KkTextField
                name={month.name}
                label={MONTH_LABEL}
                inputMode="numeric"
                autoComplete="bday-month"
                maxLength={DAY_DIGITS}
                error={hasBirthDateError}
                onChange={month.onChange}
                onBlur={month.onBlur}
                inputRef={month.ref}
              />
            </Grid>
            <Grid size={YEAR_SPAN}>
              <KkTextField
                name={year.name}
                label={YEAR_LABEL}
                inputMode="numeric"
                autoComplete="bday-year"
                maxLength={YEAR_DIGITS}
                error={hasBirthDateError}
                onChange={year.onChange}
                onBlur={year.onBlur}
                inputRef={year.ref}
              />
            </Grid>
          </Grid>
          {birthDateNote}
        </Stack>
        {failureAlert}
        <KkButton type="submit" fullWidth loading={isClaiming}>
          {CLAIM_SUBMIT_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};

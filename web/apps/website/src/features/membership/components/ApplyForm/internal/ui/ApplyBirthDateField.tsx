import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { FC } from 'react';
import { useController } from 'react-hook-form';
import { applyFieldLabels } from '@/features/membership/apply-content';
import {
  buildBirthDateBounds,
  formatBirthDateValue,
  parseBirthDateValue,
} from '@/features/membership/birth-date';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

interface ApplyBirthDateFieldProps {
  today: Date;
}

export const ApplyBirthDateField: FC<ApplyBirthDateFieldProps> = ({ today }) => {
  const { field, fieldState } = useController<MembershipApplicationForm, 'birthDate'>({
    name: 'birthDate',
  });
  const bounds = buildBirthDateBounds(today);
  const error = fieldState.error;

  const handleChange = (next: Date | null): void => {
    field.onChange(formatBirthDateValue(next));
  };

  return (
    <DatePicker
      label={applyFieldLabels.birthDate}
      value={parseBirthDateValue(field.value)}
      onChange={handleChange}
      minDate={bounds.minDate}
      maxDate={bounds.maxDate}
      openTo="year"
      views={['year', 'month', 'day']}
      slotProps={{
        textField: {
          fullWidth: true,
          required: true,
          onBlur: field.onBlur,
          inputRef: field.ref,
          error: error !== undefined,
          helperText: error?.message,
        },
      }}
    />
  );
};

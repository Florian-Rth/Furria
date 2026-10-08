import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, FC } from 'react';
import { useController } from 'react-hook-form';
import type { TicketRequestForm } from '@/features/events/schemas';
import { ticketRequestFieldLabels } from '@/features/events/ticket-request-content';
import { TICKET_COUNT_CHOICES } from '@/features/events/ticket-request-display';

export const TicketCountField: FC = () => {
  const { field, fieldState } = useController<TicketRequestForm, 'ticketCount'>({
    name: 'ticketCount',
  });
  const error = fieldState.error;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    field.onChange(Number(event.target.value));
  };

  return (
    <TextField
      select
      label={ticketRequestFieldLabels.ticketCount}
      value={field.value}
      onChange={handleChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      name={field.name}
      required
      fullWidth
      error={error !== undefined}
      helperText={error?.message}
    >
      {TICKET_COUNT_CHOICES.map((choice) => (
        <MenuItem key={choice.value} value={choice.value}>
          {choice.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

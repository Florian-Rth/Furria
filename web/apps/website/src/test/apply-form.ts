import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

const GERMAN_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export const pickBirthDate = async (user: UserEvent, isoValue: string): Promise<void> => {
  const [year, month, day] = isoValue.split('-');

  await user.click(screen.getByRole('button', { name: 'Datum auswählen' }));
  await user.click(screen.getByRole('radio', { name: year }));
  await user.click(screen.getByRole('radio', { name: GERMAN_MONTHS[Number(month) - 1] }));
  await user.click(screen.getByRole('gridcell', { name: String(Number(day)) }));
};

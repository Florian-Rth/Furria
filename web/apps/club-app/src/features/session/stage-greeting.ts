import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const GREETING = 'MOIN';

export const buildGreeting = (firstName: string): string => {
  const name = firstName.trim();

  if (name === '') {
    return `${GREETING}.`;
  }

  return `${GREETING}, ${name.toUpperCase()}.`;
};

export const formatStageDate = (date: Date): string =>
  format(date, 'EEEE, d. MMMM', { locale: de });

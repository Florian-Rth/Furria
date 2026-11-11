import { format, isValid, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const DAY_IN_YEAR_FORMAT = 'EEE, d. MMM';
const DAY_WITH_YEAR_FORMAT = 'EEE, d. MMM yyyy';

export const toMomentDayLabel = (isoDay: string, today: Date): string | null => {
  const day = parseISO(isoDay);

  if (isoDay === '' || !isValid(day)) {
    return null;
  }

  const pattern =
    day.getFullYear() === today.getFullYear() ? DAY_IN_YEAR_FORMAT : DAY_WITH_YEAR_FORMAT;

  return format(day, pattern, { locale: de });
};

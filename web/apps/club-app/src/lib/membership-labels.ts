import type { MembershipState } from '@/lib/api/schemas';

const MEMBERSHIP_STATE_LABELS: Record<MembershipState, string> = {
  none: 'kein Mitglied',
  ended: 'beendet',
  paused: 'ruht',
  active: 'aktiv',
};

const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OPEN_END = 'offen';
const SPAN_SEPARATOR = ' – ';
const ADDRESS_SEPARATOR = ', ';

export const toMembershipStateLabel = (state: MembershipState): string =>
  MEMBERSHIP_STATE_LABELS[state];

export const formatIsoDay = (isoDay: string): string => {
  if (!ISO_DAY_PATTERN.test(isoDay)) {
    return isoDay;
  }
  return `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.${isoDay.slice(0, 4)}`;
};

export const formatPeriod = (startedOn: string, endedOn: string | null): string => {
  const start = formatIsoDay(startedOn);

  if (endedOn === null) {
    return `${start}${SPAN_SEPARATOR}${OPEN_END}`;
  }

  return `${start}${SPAN_SEPARATOR}${formatIsoDay(endedOn)}`;
};

const toTrimmed = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
};

const isPresent = (value: string | null): value is string => value !== null;

export const formatAddress = (
  street: string | null,
  zip: string | null,
  city: string | null,
): string | null => {
  const place = [toTrimmed(zip), toTrimmed(city)].filter(isPresent).join(' ');
  const lines = [toTrimmed(street), toTrimmed(place)].filter(isPresent);

  if (lines.length === 0) {
    return null;
  }

  return lines.join(ADDRESS_SEPARATOR);
};

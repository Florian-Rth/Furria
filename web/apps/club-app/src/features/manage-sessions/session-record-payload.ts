import type { SessionRecordForm, SessionRecordSummary } from './schemas';

export interface SessionRecordPayload {
  startYear: number;
  number: number | null;
  motto: string | null;
  logoSvg: string | null;
}

const written = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
};

export const toSessionRecordForm = (
  record: SessionRecordSummary | null,
  draftYear: number | null,
): SessionRecordForm => {
  if (record === null) {
    return { startYear: draftYear, number: '', motto: '', logoSvg: null };
  }

  return {
    startYear: record.startYear,
    number: record.number === null ? '' : String(record.number),
    motto: record.motto ?? '',
    logoSvg: written(record.logoSvg),
  };
};

export const toSessionRecordPayload = (form: SessionRecordForm): SessionRecordPayload | null => {
  if (form.startYear === null) {
    return null;
  }

  const number = written(form.number);

  return {
    startYear: form.startYear,
    number: number === null ? null : Number(number),
    motto: written(form.motto),
    logoSvg: written(form.logoSvg),
  };
};

import { RequestFailedError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';

const FIELD_ERROR_STATUSES: readonly number[] = [400, 422];

export type AnnouncementFormField = 'title' | 'body' | 'validUntil';

export interface AnnouncementFieldError {
  field: AnnouncementFormField;
  message: string;
}

const ANNOUNCEMENT_FORM_FIELDS: readonly AnnouncementFormField[] = ['title', 'body', 'validUntil'];

interface NamedFailure {
  field: string;
  message: string;
}

const isAnnouncementFormField = (value: string): value is AnnouncementFormField =>
  ANNOUNCEMENT_FORM_FIELDS.some((field) => field === value);

const isAnnouncementFieldError = (failure: NamedFailure): failure is AnnouncementFieldError =>
  isAnnouncementFormField(failure.field);

export const toAnnouncementFieldErrors = (error: Error | null): AnnouncementFieldError[] => {
  if (!(error instanceof RequestFailedError) || !FIELD_ERROR_STATUSES.includes(error.status)) {
    return [];
  }

  return error.failures
    .map((failure) => ({ field: toCamelCaseField(failure.field), message: failure.message }))
    .filter(isAnnouncementFieldError);
};

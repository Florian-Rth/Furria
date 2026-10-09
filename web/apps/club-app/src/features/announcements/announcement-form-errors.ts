import type { ApiFieldFailure } from '@furria/api-client';
import { refusalOf } from '@furria/api-client';

const FIELD_ERROR_STATUSES: readonly number[] = [400, 422];

export type AnnouncementFormField = 'title' | 'body' | 'validUntil';

export interface AnnouncementFieldError {
  field: AnnouncementFormField;
  message: string;
}

const ANNOUNCEMENT_FORM_FIELDS: readonly AnnouncementFormField[] = ['title', 'body', 'validUntil'];

const isAnnouncementFormField = (value: string): value is AnnouncementFormField =>
  ANNOUNCEMENT_FORM_FIELDS.some((field) => field === value);

const isAnnouncementFieldError = (failure: ApiFieldFailure): failure is AnnouncementFieldError =>
  isAnnouncementFormField(failure.field);

export const toAnnouncementFieldErrors = (error: Error | null): AnnouncementFieldError[] => {
  const refusal = refusalOf(error);

  if (refusal === null || !FIELD_ERROR_STATUSES.includes(refusal.status)) {
    return [];
  }

  return refusal.fields.filter(isAnnouncementFieldError);
};

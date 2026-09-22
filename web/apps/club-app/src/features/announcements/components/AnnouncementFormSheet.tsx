import { KkAlert, KkDateField, KkSheet, KkTextArea, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ANNOUNCEMENT_FORM_SHEET_ID } from '@/lib/announcements';
import {
  ANNOUNCEMENT_BODY_FIELD_LABEL,
  ANNOUNCEMENT_BODY_PLACEHOLDER,
  ANNOUNCEMENT_TITLE_FIELD_LABEL,
  ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL,
  ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL,
  EDIT_CONFIRM_LABEL,
  EDIT_SHEET_TITLE,
  POST_CONFIRM_LABEL,
  POST_SHEET_TITLE,
  SHEET_CANCEL_LABEL,
  SHEET_CLOSE_LABEL,
} from '../announcements-labels';
import { useAnnouncementForm } from '../hooks/use-announcement-form';
import type { AnnouncementSheet } from '../hooks/use-announcement-sheet';
import { ANNOUNCEMENT_BODY_MAX_LENGTH, toAnnouncementFormValues } from '../schemas';

const BODY_ROWS = 7;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface AnnouncementFormSheetProps {
  sheet: AnnouncementSheet;
}

export const AnnouncementFormSheet: FC<AnnouncementFormSheetProps> = ({ sheet }) => {
  const isEditing = sheet.edited !== null;
  const sheetTitle = isEditing ? EDIT_SHEET_TITLE : POST_SHEET_TITLE;
  const confirmLabel = isEditing ? EDIT_CONFIRM_LABEL : POST_CONFIRM_LABEL;
  const control = useAnnouncementForm({
    announcementId: sheet.edited?.announcementId ?? null,
    open: sheet.isOpen,
    initial: toAnnouncementFormValues(sheet.edited),
    onSaved: sheet.close,
  });
  const { errors } = control.form.formState;

  const titleField = control.form.register('title');
  const body = control.form.watch('body');
  const validUntil = control.form.watch('validUntil');

  const setBody = (value: string): void => {
    control.form.setValue('body', value, { shouldValidate: false });
  };

  const setValidUntil = (value: string | null): void => {
    control.form.setValue('validUntil', value, { shouldValidate: false });
  };

  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkSheet id={ANNOUNCEMENT_FORM_SHEET_ID} title={sheetTitle} closeLabel={SHEET_CLOSE_LABEL}>
      <KkSheet.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <KkTextField
            name={titleField.name}
            label={ANNOUNCEMENT_TITLE_FIELD_LABEL}
            inputRef={titleField.ref}
            onChange={titleField.onChange}
            onBlur={titleField.onBlur}
            error={errors.title !== undefined}
            helperText={errors.title?.message}
          />
          <KkTextArea
            name="body"
            label={ANNOUNCEMENT_BODY_FIELD_LABEL}
            value={body}
            onChange={setBody}
            rows={BODY_ROWS}
            maxLength={ANNOUNCEMENT_BODY_MAX_LENGTH}
            showCount
            countLabel={toCountLabel}
            placeholder={ANNOUNCEMENT_BODY_PLACEHOLDER}
            error={errors.body !== undefined}
            helperText={errors.body?.message}
          />
          <KkDateField
            name="validUntil"
            label={ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL}
            value={validUntil}
            onChange={setValidUntil}
            allowEmpty
            emptyLabel={ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL}
            error={errors.validUntil !== undefined}
            helperText={errors.validUntil?.message}
          />
          {rejection}
        </Stack>
      </KkSheet.Body>
      <KkSheet.Actions
        primary={{ label: confirmLabel, onClick: control.submit, loading: control.isSaving }}
        secondary={{
          label: SHEET_CANCEL_LABEL,
          onClick: sheet.close,
          disabled: control.isSaving,
        }}
      />
    </KkSheet>
  );
};

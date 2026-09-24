import { KkDateField, KkTextArea, KkTextField, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import {
  ANNOUNCEMENT_ADD_LABEL,
  ANNOUNCEMENT_BODY_FIELD_LABEL,
  ANNOUNCEMENT_BODY_PLACEHOLDER,
  ANNOUNCEMENT_CREATE_TITLE,
  ANNOUNCEMENT_EDIT_TITLE,
  ANNOUNCEMENT_SAVE_LABEL,
  ANNOUNCEMENT_TITLE_FIELD_LABEL,
  ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL,
  ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL,
  ANNOUNCEMENTS_ORIGIN,
  WITHDRAW_ANNOUNCEMENT_DANGER_LABEL,
} from '../announcements-labels';
import { useAnnouncementEditor } from '../hooks/use-announcement-editor';
import { useAnnouncementWithdrawal } from '../hooks/use-announcement-withdrawal';
import type { Announcement } from '../schemas';
import { ANNOUNCEMENT_BODY_MAX_LENGTH } from '../schemas';
import { WithdrawAnnouncementDialog } from './WithdrawAnnouncementDialog';

const BODY_ROWS = 7;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface AnnouncementEditorProps {
  announcement: Announcement | null;
}

export const AnnouncementEditor: FC<AnnouncementEditorProps> = ({ announcement }) => {
  const control = useAnnouncementEditor({ announcement });
  const { errors } = control.form.formState;

  const titleField = control.form.register('title');

  const title = announcement === null ? ANNOUNCEMENT_CREATE_TITLE : ANNOUNCEMENT_EDIT_TITLE;
  const actionLabel = announcement === null ? ANNOUNCEMENT_ADD_LABEL : ANNOUNCEMENT_SAVE_LABEL;
  const withdrawal = useAnnouncementWithdrawal(announcement);

  const dangerLine =
    announcement === null ? null : (
      <>
        <KkWriteScreen.Danger
          label={WITHDRAW_ANNOUNCEMENT_DANGER_LABEL}
          onSelect={withdrawal.open}
        />
        <WithdrawAnnouncementDialog announcement={announcement} control={withdrawal} />
      </>
    );

  return (
    <WriteScreen
      origin={ANNOUNCEMENTS_ORIGIN}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <KkTextField
        name={titleField.name}
        label={ANNOUNCEMENT_TITLE_FIELD_LABEL}
        required
        inputRef={titleField.ref}
        onChange={titleField.onChange}
        onBlur={titleField.onBlur}
        error={errors.title !== undefined}
        helperText={errors.title?.message}
      />
      <KkTextArea
        name="body"
        label={ANNOUNCEMENT_BODY_FIELD_LABEL}
        value={control.body}
        onChange={control.setBody}
        onBlur={control.touchBody}
        required
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
        value={control.validUntil}
        onChange={control.setValidUntil}
        allowEmpty
        emptyLabel={ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL}
        error={errors.validUntil !== undefined}
        helperText={errors.validUntil?.message}
      />
      {dangerLine}
    </WriteScreen>
  );
};

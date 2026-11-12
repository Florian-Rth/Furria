import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkRichTextArea } from '@furria/ui/KkRichTextArea';
import { KkTextField } from '@furria/ui/KkTextField';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { RichTextLinkSheet } from '@/features/rich-text/components/RichTextLinkSheet';
import { RichTextMentionLayer } from '@/features/rich-text/components/RichTextMentionLayer';
import { FORMAT_RAIL_LABEL } from '@/features/rich-text/rich-text-copy';
import { WriteScreen } from '@/features/write/WriteScreen';
import { ANNOUNCEMENT_LINK_SHEET_ID } from '../announcement-mention-copy';
import {
  ANNOUNCEMENT_ADD_LABEL,
  ANNOUNCEMENT_BODY_FIELD_LABEL,
  ANNOUNCEMENT_BODY_PLACEHOLDER,
  ANNOUNCEMENT_CONTENT_SECTION_TITLE,
  ANNOUNCEMENT_CREATE_TITLE,
  ANNOUNCEMENT_EDIT_TITLE,
  ANNOUNCEMENT_RUNTIME_SECTION_TITLE,
  ANNOUNCEMENT_SAVE_LABEL,
  ANNOUNCEMENT_TITLE_FIELD_LABEL,
  ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL,
  ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL,
  ANNOUNCEMENTS_ORIGIN,
  toValidUntilQuickChoices,
  WITHDRAW_ANNOUNCEMENT_DANGER_LABEL,
} from '../announcements-labels';
import { useAnnouncementEditor } from '../hooks/use-announcement-editor';
import { useAnnouncementWithdrawal } from '../hooks/use-announcement-withdrawal';
import type { Announcement } from '../schemas';
import { AnnouncementAddOnsSection } from './AnnouncementAddOnsSection';
import { WithdrawAnnouncementDialog } from './WithdrawAnnouncementDialog';

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
  const isBodyInvalid = errors.body !== undefined;
  const bodyHelper = errors.body?.message;
  const validUntilQuickChoices = toValidUntilQuickChoices(new Date());

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
      <KkFormSection title={ANNOUNCEMENT_CONTENT_SECTION_TITLE}>
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
        <KkRichTextArea
          label={ANNOUNCEMENT_BODY_FIELD_LABEL}
          formatLabel={FORMAT_RAIL_LABEL}
          formatItems={control.body.formatItems}
          hostRef={control.body.text.hostRef}
          placeholder={ANNOUNCEMENT_BODY_PLACEHOLDER}
          isEmpty={control.body.isEmpty}
          mentionTones={control.body.mentionTones}
          required
          error={isBodyInvalid}
          helperText={bodyHelper}
        />
      </KkFormSection>
      <KkFormSection title={ANNOUNCEMENT_RUNTIME_SECTION_TITLE}>
        <KkDateField
          name="validUntil"
          label={ANNOUNCEMENT_VALID_UNTIL_FIELD_LABEL}
          value={control.validUntil}
          onChange={control.setValidUntil}
          allowEmpty
          emptyLabel={ANNOUNCEMENT_VALID_UNTIL_EMPTY_LABEL}
          quickChoices={validUntilQuickChoices}
          error={errors.validUntil !== undefined}
          helperText={errors.validUntil?.message}
        />
      </KkFormSection>
      <AnnouncementAddOnsSection
        cards={control.values.addOns}
        editor={control.addOns}
        announcement={announcement}
      />
      {dangerLine}
      <RichTextMentionLayer text={control.body.text} source={control.body.mentionables} />
      <RichTextLinkSheet text={control.body.text} sheetId={ANNOUNCEMENT_LINK_SHEET_ID} />
    </WriteScreen>
  );
};

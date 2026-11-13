import type { KkFormatRailItem } from '@furria/ui/KkFormatRail';
import type { KkProseMentionTone } from '@furria/ui/KkProseField';
import { MENTION_KINDS } from '@furria/ui/rich-text';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useFormatItems } from '@/features/rich-text/hooks/use-format-items';
import type { RichTextField } from '@/features/rich-text/hooks/use-rich-text';
import { useRichText } from '@/features/rich-text/hooks/use-rich-text';
import { mentionTonesOf } from '@/features/rich-text/mention-tones';
import type { MentionablesSource } from '@/features/rich-text/types';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { toAnnouncementFormValues, toAnnouncementPayload } from '../announcement-add-ons';
import {
  ANNOUNCEMENT_BODY_FIELD_ID,
  ANNOUNCEMENT_PICKER_LIST_ID,
} from '../announcement-mention-copy';
import { ANNOUNCEMENT_BODY_FIELD_LABEL } from '../announcements-labels';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from '../api';
import type { Announcement, AnnouncementForm } from '../schemas';
import { AnnouncementFormSchema } from '../schemas';
import type { AnnouncementAddOnsEditor } from './use-announcement-add-ons-editor';
import { useAnnouncementAddOnsEditor } from './use-announcement-add-ons-editor';
import { useAnnouncementMentionables } from './use-announcement-mentionables';

const NO_ANNOUNCEMENT = 0;
const LANDING_KIND = 'announcement';

interface AnnouncementEditorInput {
  announcement: Announcement | null;
}

export interface AnnouncementBody {
  text: RichTextField;
  mentionables: MentionablesSource;
  formatItems: KkFormatRailItem[];
  mentionTones: KkProseMentionTone[];
  isEmpty: boolean;
}

export interface AnnouncementEditorControl {
  form: UseFormReturn<AnnouncementForm>;
  values: AnnouncementForm;
  addOns: AnnouncementAddOnsEditor;
  body: AnnouncementBody;
  validUntil: string | null;
  setValidUntil: (value: string | null) => void;
  submit: () => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
}

export const useAnnouncementEditor = ({
  announcement,
}: AnnouncementEditorInput): AnnouncementEditorControl => {
  const announcementId = announcement?.announcementId ?? null;
  const create = useCreateAnnouncementMutation();
  const update = useUpdateAnnouncementMutation(announcementId ?? NO_ANNOUNCEMENT);
  const mentionables = useAnnouncementMentionables();

  const write = useWriteForm({
    schema: AnnouncementFormSchema,
    defaults: toAnnouncementFormValues(announcement),
    mutate: (values) => {
      const payload = toAnnouncementPayload(values);

      return announcementId === null
        ? create.mutateAsync(payload).then((created) => created.announcementId)
        : update.mutateAsync(payload).then(() => announcementId);
    },
    landing: (id) => ({ to: '/announcements', mark: { kind: LANDING_KIND, id } }),
  });
  const body = useController({ control: write.form.control, name: 'body' });
  const validUntil = useController({ control: write.form.control, name: 'validUntil' });
  const text = useRichText({
    text: body.field.value,
    isReadOnly: write.isSaving,
    mentionKinds: MENTION_KINDS,
    mentionables: mentionables.list,
    fieldId: ANNOUNCEMENT_BODY_FIELD_ID,
    label: ANNOUNCEMENT_BODY_FIELD_LABEL,
    pickerListId: ANNOUNCEMENT_PICKER_LIST_ID,
    onChange: body.field.onChange,
  });
  const formatItems = useFormatItems(text, write.isSaving);
  const addOns = useAnnouncementAddOnsEditor(write.form);

  const setValidUntil = (value: string | null): void => {
    validUntil.field.onChange(value);
    addOns.recheckDeadlines();
  };

  return {
    ...write,
    addOns,
    body: {
      text,
      mentionables,
      formatItems,
      mentionTones: mentionTonesOf(mentionables.list, body.field.value, MENTION_KINDS),
      isEmpty: body.field.value.length === 0,
    },
    validUntil: validUntil.field.value,
    setValidUntil,
  };
};

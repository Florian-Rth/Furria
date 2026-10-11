import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from '../api';
import type { Announcement, AnnouncementForm } from '../schemas';
import { AnnouncementFormSchema, toAnnouncementFormValues } from '../schemas';

const NO_ANNOUNCEMENT = 0;
const LANDING_KIND = 'announcement';

interface AnnouncementEditorInput {
  announcement: Announcement | null;
}

export interface AnnouncementEditorControl {
  form: UseFormReturn<AnnouncementForm>;
  body: string;
  setBody: (value: string) => void;
  touchBody: () => void;
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

  const write = useWriteForm({
    schema: AnnouncementFormSchema,
    defaults: toAnnouncementFormValues(announcement),
    mutate: (values) =>
      announcementId === null
        ? create.mutateAsync(values).then((created) => created.announcementId)
        : update.mutateAsync(values).then(() => announcementId),
    landing: (id) => ({ to: '/announcements', mark: { kind: LANDING_KIND, id } }),
  });
  const body = useController({ control: write.form.control, name: 'body' });
  const validUntil = useController({ control: write.form.control, name: 'validUntil' });

  return {
    ...write,
    body: body.field.value,
    setBody: body.field.onChange,
    touchBody: body.field.onBlur,
    validUntil: validUntil.field.value,
    setValidUntil: validUntil.field.onChange,
  };
};

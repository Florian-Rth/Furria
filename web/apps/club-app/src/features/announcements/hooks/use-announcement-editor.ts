import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toAnnouncementFieldErrors } from '../announcement-form-errors';
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
  submit: () => void;
  isDirty: boolean;
  isSaving: boolean;
  rejection: string | null;
}

export const useAnnouncementEditor = ({
  announcement,
}: AnnouncementEditorInput): AnnouncementEditorControl => {
  const announcementId = announcement?.announcementId ?? null;
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateAnnouncementMutation();
  const update = useUpdateAnnouncementMutation(announcementId ?? NO_ANNOUNCEMENT);
  const navigate = useNavigate();

  const form = useForm<AnnouncementForm>({
    resolver: zodResolver(AnnouncementFormSchema),
    defaultValues: toAnnouncementFormValues(announcement),
  });

  const landOn = (id: number): void => {
    void navigate({
      to: '/announcements',
      search: (previous) => ({ ...previous, changed: toLandingKey(LANDING_KIND, id) }),
      replace: true,
    });
  };

  const reject = (error: Error): void => {
    const fieldErrors = toAnnouncementFieldErrors(error);

    for (const fieldError of fieldErrors) {
      form.setError(fieldError.field, { message: fieldError.message });
    }
    setRejection(fieldErrors.length === 0 ? toWriteErrorMessage(error) : null);
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (announcementId === null) {
      create.mutate(values, {
        onSuccess: (created) => landOn(created.announcementId),
        onError: reject,
      });
      return;
    }

    update.mutate(values, { onSuccess: () => landOn(announcementId), onError: reject });
  });

  return {
    form,
    submit: () => {
      void handleFormSubmit();
    },
    isDirty: form.formState.isDirty,
    isSaving: create.isPending || update.isPending,
    rejection,
  };
};

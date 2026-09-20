import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toAnnouncementFieldErrors } from '../announcement-form-errors';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation } from '../api';
import type { AnnouncementForm } from '../schemas';
import { AnnouncementFormSchema } from '../schemas';

const NO_ANNOUNCEMENT = 0;

interface AnnouncementFormInput {
  announcementId: number | null;
  open: boolean;
  initial: AnnouncementForm;
  onSaved: () => void;
}

export interface AnnouncementFormControl {
  form: UseFormReturn<AnnouncementForm>;
  submit: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export const useAnnouncementForm = ({
  announcementId,
  open,
  initial,
  onSaved,
}: AnnouncementFormInput): AnnouncementFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const create = useCreateAnnouncementMutation();
  const update = useUpdateAnnouncementMutation(announcementId ?? NO_ANNOUNCEMENT);

  const form = useForm<AnnouncementForm>({
    resolver: zodResolver(AnnouncementFormSchema),
    defaultValues: initial,
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(initial);
      setRejection(null);
    }
  }

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
      create.mutate(values, { onSuccess: onSaved, onError: reject });

      return;
    }

    update.mutate(values, { onSuccess: onSaved, onError: reject });
  });

  return {
    form,
    submit: () => {
      void handleFormSubmit();
    },
    isSaving: create.isPending || update.isPending,
    rejection,
  };
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { relevantSessionYear } from '@/lib/club';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateSessionRecordMutation, useUpdateSessionRecordMutation } from '../api';
import type { SessionRecordForm, SessionRecordSummary } from '../schemas';
import { SessionRecordFormSchema } from '../schemas';
import { toLogoFileRejection, UNREADABLE_FILE_MESSAGE } from '../session-logo-file';
import { toSessionRecordForm, toSessionRecordPayload } from '../session-record-payload';

interface SessionRecordFormInput {
  record: SessionRecordSummary | null;
  open: boolean;
  onSaved: () => void;
}

export interface SessionRecordFormControl {
  form: UseFormReturn<SessionRecordForm>;
  startYear: number | null;
  setStartYear: (value: number | null) => void;
  logoSvg: string | null;
  logoRejection: string | null;
  takeLogoFile: (file: File | null) => void;
  clearLogo: () => void;
  currentSessionYear: number;
  isEditing: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useSessionRecordForm = ({
  record,
  open,
  onSaved,
}: SessionRecordFormInput): SessionRecordFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [logoRejection, setLogoRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const createMutation = useCreateSessionRecordMutation();
  const updateMutation = useUpdateSessionRecordMutation();

  const form = useForm<SessionRecordForm>({
    resolver: zodResolver(SessionRecordFormSchema),
    defaultValues: toSessionRecordForm(record),
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(toSessionRecordForm(record));
      setRejection(null);
      setLogoRejection(null);
    }
  }

  const setStartYear = (value: number | null): void => {
    form.setValue('startYear', value, { shouldValidate: true });
  };

  const setLogo = (value: string | null): void => {
    form.setValue('logoSvg', value, { shouldValidate: true });
  };

  const clearLogo = (): void => {
    setLogoRejection(null);
    setLogo(null);
  };

  const takeLogoFile = (file: File | null): void => {
    if (file === null) {
      return;
    }

    const refusal = toLogoFileRejection({ type: file.type, size: file.size });

    if (refusal !== null) {
      setLogoRejection(refusal);
      return;
    }

    const reader = new FileReader();

    reader.onload = (): void => {
      if (typeof reader.result === 'string') {
        setLogoRejection(null);
        setLogo(reader.result);
      }
    };
    reader.onerror = (): void => {
      setLogoRejection(UNREADABLE_FILE_MESSAGE);
    };
    reader.readAsText(file);
  };

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const handleSubmit = form.handleSubmit((values) => {
    const payload = toSessionRecordPayload(values);

    if (payload === null) {
      return;
    }

    setRejection(null);

    if (record === null) {
      createMutation.mutate(payload, { onSuccess: onSaved, onError: fail });
      return;
    }

    updateMutation.mutate(
      { sessionId: record.sessionId, payload },
      { onSuccess: onSaved, onError: fail },
    );
  });

  const submit = (): void => {
    void handleSubmit();
  };

  return {
    form,
    startYear: form.watch('startYear'),
    setStartYear,
    logoSvg: form.watch('logoSvg'),
    logoRejection,
    takeLogoFile,
    clearLogo,
    currentSessionYear: relevantSessionYear(new Date()),
    isEditing: record !== null,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    submit,
  };
};

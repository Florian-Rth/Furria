import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { relevantSessionYear } from '@/lib/club';
import { useCreateSessionRecordMutation, useUpdateSessionRecordMutation } from '../api';
import type { SessionRecordForm, SessionRecordSummary } from '../schemas';
import { SessionRecordFormSchema } from '../schemas';
import { toLogoFileRejection, UNREADABLE_FILE_MESSAGE } from '../session-logo-file';
import { toSessionRecordForm, toSessionRecordPayload } from '../session-record-payload';

export interface SessionEditorControl {
  form: UseFormReturn<SessionRecordForm>;
  startYear: number | null;
  setStartYear: (value: number | null) => void;
  logoSvg: string | null;
  logoRejection: string | null;
  takeLogoFile: (file: File | null) => void;
  clearLogo: () => void;
  currentSessionYear: number;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useSessionEditor = (
  record: SessionRecordSummary | null,
  draftYear: number | null,
): SessionEditorControl => {
  const [logoRejection, setLogoRejection] = useState<string | null>(null);
  const createMutation = useCreateSessionRecordMutation();
  const updateMutation = useUpdateSessionRecordMutation();

  const write = useWriteForm({
    schema: SessionRecordFormSchema,
    defaults: toSessionRecordForm(record, draftYear),
    mutate: (values) => {
      const payload = toSessionRecordPayload(values);

      if (payload === null) {
        return null;
      }

      return record === null
        ? createMutation.mutateAsync(payload).then((created) => created.sessionId)
        : updateMutation
            .mutateAsync({ sessionId: record.sessionId, payload })
            .then(() => record.sessionId);
    },
    landing: (sessionId) => ({ to: '/manage/sessions', mark: { kind: 'session', id: sessionId } }),
  });
  const { form } = write;

  const setStartYear = (value: number | null): void => {
    form.setValue('startYear', value, { shouldValidate: true, shouldDirty: true });
  };

  const setLogo = (value: string | null): void => {
    form.setValue('logoSvg', value, { shouldValidate: true, shouldDirty: true });
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

  return {
    form,
    startYear: form.watch('startYear'),
    setStartYear,
    logoSvg: form.watch('logoSvg'),
    logoRejection,
    takeLogoFile,
    clearLogo,
    currentSessionYear: relevantSessionYear(new Date()),
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};

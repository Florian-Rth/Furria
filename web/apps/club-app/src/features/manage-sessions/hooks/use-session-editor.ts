import type { UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { relevantSessionYear } from '@/lib/club';
import { useCreateSessionRecordMutation, useUpdateSessionRecordMutation } from '../api';
import type { SessionRecordForm, SessionRecordSummary } from '../schemas';
import { SessionRecordFormSchema } from '../schemas';
import { toSessionRecordForm, toSessionRecordPayload } from '../session-record-payload';
import type { SessionLogoControl } from './use-session-logo';
import { useSessionLogo } from './use-session-logo';

export interface SessionEditorControl {
  form: UseFormReturn<SessionRecordForm>;
  startYear: number | null;
  setStartYear: (value: number | null) => void;
  number: string;
  setNumber: (value: string) => void;
  logo: SessionLogoControl;
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
  const logo = useSessionLogo(record?.logo ?? null);
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

      const written =
        record === null
          ? createMutation.mutateAsync(payload).then((created) => created.sessionId)
          : updateMutation
              .mutateAsync({ sessionId: record.sessionId, payload })
              .then(() => record.sessionId);

      return written.then(async (sessionId) => {
        await logo.sendTo(sessionId);

        return sessionId;
      });
    },
    landing: (sessionId) => ({ to: '/manage/sessions', mark: { kind: 'session', id: sessionId } }),
  });
  const { form } = write;

  const setStartYear = (value: number | null): void => {
    form.setValue('startYear', value, { shouldValidate: true, shouldDirty: true });
  };

  const setNumber = (value: string): void => {
    form.setValue('number', value, { shouldValidate: true, shouldDirty: true });
  };

  return {
    form,
    startYear: form.watch('startYear'),
    setStartYear,
    number: write.values.number,
    setNumber,
    logo,
    currentSessionYear: relevantSessionYear(new Date()),
    isDirty: write.isDirty || logo.isChanged,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};

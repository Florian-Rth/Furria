import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { DefaultValues, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { useGoBackTo } from '@/lib/use-go-back-to';
import type { WriteLanding } from '../landing-target';
import { toLandingNavigation } from '../landing-target';
import { toWriteFailure } from '../write-failure';

type WriteFormContext = undefined;

export type WriteTask<TResult> = Promise<TResult> | null;

export interface WriteFormInput<TValues extends FieldValues, TSubmitted, TResult> {
  schema: z.ZodType<TSubmitted, TValues>;
  defaults: DefaultValues<TValues>;
  mutate: (submitted: TSubmitted) => WriteTask<TResult>;
  landing: (result: TResult) => WriteLanding;
  onLanded?: (result: TResult) => void;
}

export interface WriteFormControl<TValues extends FieldValues, TSubmitted> {
  form: UseFormReturn<TValues, WriteFormContext, TSubmitted>;
  values: TValues;
  submit: () => void;
  run: <TResult>(
    task: () => WriteTask<TResult>,
    landing: (result: TResult) => WriteLanding,
  ) => void;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  isDirty: boolean;
}

export const useWriteForm = <TValues extends FieldValues, TSubmitted, TResult>({
  schema,
  defaults,
  mutate,
  landing,
  onLanded,
}: WriteFormInput<TValues, TSubmitted, TResult>): WriteFormControl<TValues, TSubmitted> => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const goBackTo = useGoBackTo();

  const form = useForm<TValues, WriteFormContext, TSubmitted>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const values = useWatch({ control: form.control, compute: (all: TValues) => all });

  useEffect(() => {
    const edits = form.watch(() => {
      setRejection(null);
    });

    return () => {
      edits.unsubscribe();
    };
  }, [form]);

  const isFieldName = (name: string): name is Path<TValues> => name in form.getValues();

  const showFailure = (error: Error): void => {
    const failure = toWriteFailure(error, Object.keys(form.getValues()).filter(isFieldName));

    for (const field of failure.fields) {
      form.setError(field.name, { message: field.message });
    }

    setRejection(failure.footer);
  };

  const land = (target: WriteLanding): Promise<void> => {
    const { to, params, search } = toLandingNavigation(target);

    return goBackTo({
      to,
      params,
      search: search === undefined ? undefined : (previous) => ({ ...previous, ...search }),
      ignoreBlocker: true,
    });
  };

  const run = <TTaskResult>(
    task: () => WriteTask<TTaskResult>,
    landingOf: (result: TTaskResult) => WriteLanding,
    landed?: (result: TTaskResult) => void,
  ): void => {
    const pending = task();

    if (pending === null) {
      return;
    }

    setRejection(null);
    setIsSaving(true);
    void pending.then(
      async (result) => {
        await land(landingOf(result));
        setIsSaving(false);
        landed?.(result);
      },
      (error: Error) => {
        setIsSaving(false);
        showFailure(error);
      },
    );
  };

  const handleSubmit = form.handleSubmit((submitted) => {
    run(() => mutate(submitted), landing, onLanded);
  });

  return {
    form,
    values,
    submit: () => {
      void handleSubmit();
    },
    run,
    rejection,
    isSaving,
    canSubmit: isValid,
    isDirty,
  };
};

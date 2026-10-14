import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useMeQuery } from '@/features/session/api';
import { getSessionSnapshot, subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { parseWriteDraft, writeDraftKeyOf } from '../write-draft';

const readStoredDraft = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const storeDraft = (key: string, serialized: string): void => {
  try {
    window.sessionStorage.setItem(key, serialized);
  } catch {
    return;
  }
};

const forgetDraft = (key: string): void => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    return;
  }
};

export const useWriteDraft = <TValues extends FieldValues, TSubmitted>(
  form: UseFormReturn<TValues, undefined, TSubmitted>,
): void => {
  const pathname = useLocation({ select: (location) => location.pathname });
  const accountId = useMeQuery().data?.accountId ?? null;

  useEffect(() => {
    if (accountId === null) {
      return;
    }

    const key = writeDraftKeyOf(pathname);
    const draft = parseWriteDraft(readStoredDraft(key), accountId);
    const isFieldName = (name: string): name is Path<TValues> => name in form.getValues();

    forgetDraft(key);
    for (const [name, value] of Object.entries(draft ?? {})) {
      if (isFieldName(name)) {
        form.setValue(name, value, { shouldDirty: true });
      }
    }
  }, [accountId, pathname, form]);

  useEffect(() => {
    if (accountId === null) {
      return undefined;
    }

    return subscribeToSessionEnd(() => {
      if (getSessionSnapshot().expired && form.formState.isDirty) {
        storeDraft(
          writeDraftKeyOf(pathname),
          JSON.stringify({ accountId, values: form.getValues() }),
        );
      }
    });
  }, [accountId, pathname, form]);
};

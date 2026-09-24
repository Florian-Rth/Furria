import type { KkDateQuickChoice } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useGenerateTrainingsMutation, useTrainingPreviewQuery } from '../api';
import { GENERATOR_SESSION_CHOICE, GENERATOR_TITLE_DEFAULT } from '../rhythm-labels';
import type { TrainingPreviewEntry } from '../training-preview';
import {
  toDefaultTicked,
  toPreviewRows,
  toPreviewSummary,
  toTickedAll,
  toTickedCount,
  toTickedInstants,
  toToggledTicks,
} from '../training-preview';

const NO_TICKS: ReadonlySet<string> = new Set();

export interface TrainingGeneratorControl {
  title: string;
  setTitle: (value: string) => void;
  endsOn: string | null;
  setEndsOn: (value: string | null) => void;
  quickChoices: readonly KkDateQuickChoice[];
  isLoading: boolean;
  errorMessage: string | null;
  retry: () => void;
  entries: readonly TrainingPreviewEntry[];
  summary: string;
  tickedCount: number;
  toggle: (key: string) => void;
  tickAll: () => void;
  tickNone: () => void;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useTrainingGenerator = (groupId: number): TrainingGeneratorControl => {
  const [title, setTitle] = useState(GENERATOR_TITLE_DEFAULT);
  const [endsOn, setEndsOn] = useState<string | null>(null);
  const preview = useTrainingPreviewQuery(groupId, endsOn, true);
  const generate = useGenerateTrainingsMutation(groupId);
  const navigate = useNavigate();

  const rows = preview.data?.rows ?? [];
  const stamp = preview.dataUpdatedAt;
  const [tickedStamp, setTickedStamp] = useState(stamp);
  const [ticked, setTicked] = useState<ReadonlySet<string>>(NO_TICKS);

  if (tickedStamp !== stamp) {
    setTickedStamp(stamp);
    setTicked(toDefaultTicked(rows));
  }

  const entries = toPreviewRows(rows, ticked);
  const defaultEndsOn = preview.data?.defaultEndsOn ?? null;
  const quickChoices =
    defaultEndsOn === null ? [] : [{ value: defaultEndsOn, label: GENERATOR_SESSION_CHOICE }];

  const toggle = (key: string): void => {
    setTicked(toToggledTicks(ticked, key));
  };

  const tickAll = (): void => {
    setTicked(toTickedAll(entries));
  };

  const tickNone = (): void => {
    setTicked(NO_TICKS);
  };

  const retry = (): void => {
    void preview.refetch();
  };

  const submit = (): void => {
    generate.mutate(
      { title, instants: toTickedInstants(entries) },
      {
        onSuccess: () => {
          void navigate({
            to: '/groups/$groupId',
            params: { groupId: String(groupId) },
            replace: true,
          });
        },
      },
    );
  };

  return {
    title,
    setTitle,
    endsOn: endsOn ?? preview.data?.endsOn ?? null,
    setEndsOn,
    quickChoices,
    isLoading: preview.isLoading,
    errorMessage: toWriteErrorMessage(preview.error),
    retry,
    entries,
    summary: toPreviewSummary(entries),
    tickedCount: toTickedCount(entries),
    toggle,
    tickAll,
    tickNone,
    isSaving: generate.isPending,
    rejection: toWriteErrorMessage(generate.error),
    submit,
  };
};

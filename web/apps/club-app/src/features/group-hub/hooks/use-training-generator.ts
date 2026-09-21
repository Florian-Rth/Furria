import type { KkDateQuickChoice } from '@furria/ui';
import { useKkSheet } from '@furria/ui';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useGenerateTrainingsMutation, useTrainingPreviewQuery } from '../api';
import { GENERATOR_SESSION_CHOICE, GENERATOR_TITLE_DEFAULT } from '../rhythm-labels';
import type { TrainingPreviewEntry } from '../training-preview';
import {
  toDefaultTicked,
  toPreviewRows,
  toPreviewSummary,
  toTickedCount,
  toTickedInstants,
  toToggledTicks,
} from '../training-preview';

const SHEET_PREFIX = 'training-generator-';
const NO_TICKS: ReadonlySet<string> = new Set();

export interface TrainingGeneratorControl {
  sheetId: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
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

export const toTrainingGeneratorSheetId = (groupId: number): string => `${SHEET_PREFIX}${groupId}`;

export const useTrainingGenerator = (groupId: number): TrainingGeneratorControl => {
  const sheetId = toTrainingGeneratorSheetId(groupId);
  const sheet = useKkSheet();
  const isOpen = sheet.openSheetId === sheetId;

  const [title, setTitle] = useState(GENERATOR_TITLE_DEFAULT);
  const [endsOn, setEndsOn] = useState<string | null>(null);
  const preview = useTrainingPreviewQuery(groupId, endsOn, isOpen);
  const generate = useGenerateTrainingsMutation(groupId);

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
    setTicked(new Set(entries.map((entry) => entry.key)));
  };

  const tickNone = (): void => {
    setTicked(NO_TICKS);
  };

  const retry = (): void => {
    void preview.refetch();
  };

  const close = (): void => {
    sheet.close();
  };

  const open = (): void => {
    sheet.open(sheetId);
  };

  const submit = (): void => {
    generate.mutate(
      { title, instants: toTickedInstants(entries) },
      {
        onSuccess: () => {
          close();
        },
      },
    );
  };

  return {
    sheetId,
    isOpen,
    open,
    close,
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

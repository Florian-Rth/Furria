import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { useState } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import {
  toArchiveConsequence,
  toArchiveFacts,
  toArchivePlan,
  toArchiveQuestion,
  toDefaultLastDay,
  toLastDayNote,
  toLastDayNoteText,
  toLastDayVerdict,
} from '../person-archive';
import type { PersonDetails } from '../schemas';
import { usePersonArchive } from './use-person-archive';

export interface LastDayFieldModel {
  value: string | null;
  minDay: string | undefined;
  maxDay: string;
  helperText: string | undefined;
  isRefused: boolean;
}

export interface PersonArchiveDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  isSaving: boolean;
  rejection: string | undefined;
  question: string;
  facts: KkConfirmFact[];
  consequence: string;
  lastDayField: LastDayFieldModel | null;
  changeLastDay: (lastDay: string | null) => void;
  canConfirm: boolean;
}

export const usePersonArchiveDialog = (person: PersonDetails): PersonArchiveDialog => {
  const todayIsoDay = toIsoDay(new Date());
  const latestLastDay = toDefaultLastDay(todayIsoDay);
  const [lastDay, setLastDay] = useState<string | null>(latestLastDay);
  const plan = toArchivePlan(person, todayIsoDay, lastDay);
  const asksLastDay = plan.ends.length > 0;
  const verdict = toLastDayVerdict(lastDay, plan, todayIsoDay);
  const isRefused = asksLastDay && verdict !== 'fine';
  const archive = usePersonArchive(person, asksLastDay ? lastDay : null);

  const open = (): void => {
    setLastDay(latestLastDay);
    archive.open();
  };

  return {
    isOpen: archive.isOpen,
    open,
    close: archive.close,
    submit: archive.submit,
    isSaving: archive.isSaving,
    rejection: archive.rejection ?? undefined,
    question: toArchiveQuestion(person),
    facts: toArchiveFacts(person, plan, lastDay),
    consequence: toArchiveConsequence(person, formatIsoDay(todayIsoDay), plan),
    lastDayField: asksLastDay
      ? {
          value: lastDay,
          minDay: plan.earliestLastDay ?? undefined,
          maxDay: latestLastDay,
          helperText: toLastDayNoteText(toLastDayNote(verdict, plan, lastDay), plan) ?? undefined,
          isRefused,
        }
      : null,
    changeLastDay: setLastDay,
    canConfirm: !isRefused,
  };
};

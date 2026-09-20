import { useState } from 'react';
import type { SessionRecordSummary } from '../schemas';

export type SessionDialogKind = 'create' | 'edit' | 'delete';

export interface SessionDialogs {
  open: SessionDialogKind | null;
  record: SessionRecordSummary | null;
  openCreate: () => void;
  openEdit: (record: SessionRecordSummary) => void;
  openDelete: (record: SessionRecordSummary) => void;
  close: () => void;
}

export const useSessionDialogs = (): SessionDialogs => {
  const [open, setOpen] = useState<SessionDialogKind | null>(null);
  const [record, setRecord] = useState<SessionRecordSummary | null>(null);

  return {
    open,
    record,
    openCreate: () => {
      setRecord(null);
      setOpen('create');
    },
    openEdit: (chosen: SessionRecordSummary) => {
      setRecord(chosen);
      setOpen('edit');
    },
    openDelete: (chosen: SessionRecordSummary) => {
      setRecord(chosen);
      setOpen('delete');
    },
    close: () => {
      setOpen(null);
    },
  };
};

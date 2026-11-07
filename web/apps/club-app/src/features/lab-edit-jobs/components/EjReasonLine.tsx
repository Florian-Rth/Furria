import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EjReason } from '../edit-jobs';
import { reasonsOf } from '../edit-jobs';
import { reasonLineOf } from '../edit-jobs-copy';

interface EjReasonLineProps {
  actions: readonly { disabled: boolean; reason: EjReason | null }[];
}

export const EjReasonLine: FC<EjReasonLineProps> = ({ actions }) => {
  const text = reasonLineOf(reasonsOf(actions));

  if (text === null) {
    return null;
  }

  return <KkEjPanel.Note text={text} />;
};

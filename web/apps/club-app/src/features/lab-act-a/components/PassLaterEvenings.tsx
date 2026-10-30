import { KkDensePanel } from '@furria/ui/KkDensePanel';
import type { FC } from 'react';
import { useId } from 'react';
import type { PassEveningLine as PassEveningLineModel } from '../pass-act';
import { LATER_EVENINGS_TITLE } from '../pass-copy';
import { PassEveningLine } from './PassEveningLine';

interface PassLaterEveningsProps {
  evenings: readonly PassEveningLineModel[];
}

export const PassLaterEvenings: FC<PassLaterEveningsProps> = ({ evenings }) => {
  const headingId = useId();

  if (evenings.length === 0) {
    return null;
  }

  const lines = evenings.map((evening) => (
    <PassEveningLine key={evening.eventId} evening={evening} />
  ));

  return (
    <KkDensePanel material="own" labelledBy={headingId}>
      <KkDensePanel.Head id={headingId} label={LATER_EVENINGS_TITLE} />
      <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
    </KkDensePanel>
  );
};

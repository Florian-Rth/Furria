import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { EVENINGS_EMPTY, EVENINGS_NOTE, EVENINGS_TITLE } from '../act-evenings-copy';
import { useActEvenings } from '../hooks/use-act-evenings';
import type { ActStudioResponse, Studio } from '../schemas';
import { ActEveningRow } from './ActEveningRow';

interface ActEveningsSectionProps {
  data: ActStudioResponse;
  studio: Studio;
}

export const ActEveningsSection: FC<ActEveningsSectionProps> = ({ data, studio }) => {
  const evenings = useActEvenings(data, studio);
  const rows = evenings.rows.map((row) => (
    <ActEveningRow key={row.eventId} row={row} busy={evenings.isJoining} onJoin={evenings.join} />
  ));
  const list = rows.length === 0 ? <KkNote>{EVENINGS_EMPTY}</KkNote> : <KkPanel>{rows}</KkPanel>;
  const meta = <KkMeta>{String(rows.length)}</KkMeta>;

  return (
    <KkPanelSection title={EVENINGS_TITLE} meta={meta} description={EVENINGS_NOTE}>
      {list}
    </KkPanelSection>
  );
};

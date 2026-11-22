import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import type { WhatsAppRefusedAdd } from '../schemas';
import { REFUSED_ADDS_EMPTY, REFUSED_ADDS_HINT, REFUSED_ADDS_TITLE } from '../whatsapp-copy';
import { WhatsAppRefusedAddRow } from './WhatsAppRefusedAddRow';

interface WhatsAppRefusedAddsPanelProps {
  refusedAdds: readonly WhatsAppRefusedAdd[];
}

export const WhatsAppRefusedAddsPanel: FC<WhatsAppRefusedAddsPanelProps> = ({ refusedAdds }) => {
  const rows = refusedAdds.map((add) => <WhatsAppRefusedAddRow key={add.personId} add={add} />);
  const body =
    refusedAdds.length === 0 ? (
      <KkNote tone="muted">{REFUSED_ADDS_EMPTY}</KkNote>
    ) : (
      <>
        <KkNote tone="hint" icon="info">
          {REFUSED_ADDS_HINT}
        </KkNote>
        <KkPanel variant="list">{rows}</KkPanel>
      </>
    );

  return <KkPanelSection title={REFUSED_ADDS_TITLE}>{body}</KkPanelSection>;
};

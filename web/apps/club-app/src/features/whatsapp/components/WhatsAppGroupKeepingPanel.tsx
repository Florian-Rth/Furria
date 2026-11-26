import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { useWhatsAppGroupKeeping } from '../hooks/use-whatsapp-group-keeping';
import {
  GROUP_KEEPING_DESCRIPTION,
  GROUP_KEEPING_LABEL,
  GROUP_KEEPING_TITLE,
  INVITE_LINK_LABEL,
} from '../whatsapp-copy';
import { WHATSAPP_HELP_SPOTS } from '../whatsapp-help-copy';

interface WhatsAppGroupKeepingPanelProps {
  keepsClubGroup: boolean;
  inviteLink: string | null;
}

export const WhatsAppGroupKeepingPanel: FC<WhatsAppGroupKeepingPanelProps> = ({
  keepsClubGroup,
  inviteLink,
}) => {
  const keeping = useWhatsAppGroupKeeping(keepsClubGroup);
  const inviteRow =
    inviteLink === null ? null : <KkFieldRow label={INVITE_LINK_LABEL} value={inviteLink} />;

  return (
    <KkPanelSection title={GROUP_KEEPING_TITLE} landing={WHATSAPP_HELP_SPOTS.keeping}>
      <KkPanel variant="block" sx={{ gap: 1.75 }}>
        <KkSwitchRow
          label={GROUP_KEEPING_LABEL}
          description={GROUP_KEEPING_DESCRIPTION}
          checked={keeping.keepsMembers}
          onChange={keeping.switchKeeping}
          stateLabel={SWITCH_STATE_LABELS}
          busy={keeping.isSwitching}
        />
        {inviteRow}
      </KkPanel>
    </KkPanelSection>
  );
};

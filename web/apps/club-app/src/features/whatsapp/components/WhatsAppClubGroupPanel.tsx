import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkRadioGroup } from '@furria/ui/KkRadioGroup';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useWhatsAppClubGroup } from '../hooks/use-whatsapp-club-group';
import type { WhatsAppGroup } from '../schemas';
import {
  CLUB_GROUP_EMPTY,
  CLUB_GROUP_GONE,
  CLUB_GROUP_LABEL,
  CLUB_GROUP_TITLE,
} from '../whatsapp-copy';

interface WhatsAppClubGroupPanelProps {
  groups: readonly WhatsAppGroup[];
  clubChatId: string | null;
}

export const WhatsAppClubGroupPanel: FC<WhatsAppClubGroupPanelProps> = ({ groups, clubChatId }) => {
  const clubGroup = useWhatsAppClubGroup(groups, clubChatId);
  const options = groups.map((group) => (
    <KkRadioGroup.Option
      key={group.chatId}
      value={group.chatId}
      label={group.name}
      disabled={clubGroup.isPicking}
    />
  ));
  const goneNote = clubGroup.isGone ? (
    <KkNote tone="warning" icon="alert">
      {CLUB_GROUP_GONE}
    </KkNote>
  ) : null;
  const choice =
    groups.length === 0 ? (
      <KkNote tone="hint" icon="info">
        {CLUB_GROUP_EMPTY}
      </KkNote>
    ) : (
      <KkRadioGroup
        name="clubGroup"
        label={CLUB_GROUP_LABEL}
        value={clubGroup.pickedChatId}
        onChange={clubGroup.pick}
      >
        {options}
      </KkRadioGroup>
    );

  return (
    <KkPanelSection title={CLUB_GROUP_TITLE}>
      <KkPanel>
        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          {goneNote}
          {choice}
        </Stack>
      </KkPanel>
    </KkPanelSection>
  );
};

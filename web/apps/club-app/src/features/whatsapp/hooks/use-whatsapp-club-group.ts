import { usePickWhatsAppClubGroupMutation } from '../api';
import type { WhatsAppGroup } from '../schemas';

export interface WhatsAppClubGroupControl {
  pickedChatId: string | null;
  isGone: boolean;
  isPicking: boolean;
  pick: (chatId: string) => void;
}

export const useWhatsAppClubGroup = (
  groups: readonly WhatsAppGroup[],
  clubChatId: string | null,
): WhatsAppClubGroupControl => {
  const pickGroup = usePickWhatsAppClubGroupMutation();

  return {
    pickedChatId: pickGroup.isPending ? pickGroup.variables : clubChatId,
    isGone: clubChatId !== null && !groups.some((group) => group.chatId === clubChatId),
    isPicking: pickGroup.isPending,
    pick: (chatId) => {
      pickGroup.mutate(chatId);
    },
  };
};

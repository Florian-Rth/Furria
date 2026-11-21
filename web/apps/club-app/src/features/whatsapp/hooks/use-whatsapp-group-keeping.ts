import { useWhatsAppGroupKeepingMutation } from '../api';

export interface WhatsAppGroupKeepingControl {
  keepsMembers: boolean;
  isSwitching: boolean;
  switchKeeping: (keepsMembers: boolean) => void;
}

export const useWhatsAppGroupKeeping = (keepsClubGroup: boolean): WhatsAppGroupKeepingControl => {
  const mutation = useWhatsAppGroupKeepingMutation();

  return {
    keepsMembers: mutation.isPending ? mutation.variables : keepsClubGroup,
    isSwitching: mutation.isPending,
    switchKeeping: (keepsMembers) => {
      mutation.mutate(keepsMembers);
    },
  };
};

const INVITE_TARGET = '_blank';
const INVITE_FEATURES = 'noopener';

export const useClubGroupJoin =
  (inviteLink: string): (() => void) =>
  () => {
    window.open(inviteLink, INVITE_TARGET, INVITE_FEATURES);
  };

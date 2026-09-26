import type { PersonAccess } from './schemas';

export type MailInvitationAct = 'invite' | 'reinvite';

export interface AccessActions {
  mailInvitation: MailInvitationAct | null;
  inPersonInvitation: boolean;
}

const NO_ACTIONS: AccessActions = { mailInvitation: null, inPersonInvitation: false };

const hasAccount = (access: PersonAccess): boolean =>
  access.state === 'active' || access.state === 'disabled';

const hasAddress = (email: string | null): boolean => email !== null && email.trim() !== '';

export const accessActionsOf = (access: PersonAccess, email: string | null): AccessActions => {
  if (hasAccount(access) || access.reason !== null || !hasAddress(email)) {
    return NO_ACTIONS;
  }
  if (access.invitation !== null || access.state === 'invited') {
    return { mailInvitation: 'reinvite', inPersonInvitation: true };
  }

  return { mailInvitation: 'invite', inPersonInvitation: true };
};

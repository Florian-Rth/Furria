import type { PersonAccess } from './schemas';

export type MailInvitationAct = 'invite' | 'reinvite';

export type AccountLockAct = 'disable' | 'enable';

export interface AccessActions {
  mailInvitation: MailInvitationAct | null;
  inPersonInvitation: boolean;
  lacksMailAddress: boolean;
  vouchesForAge: boolean;
  recovery: boolean;
  lock: AccountLockAct | null;
}

interface AccessActionsInput {
  access: PersonAccess;
  email: string | null;
  isOwnAccount: boolean;
}

const NO_ACTIONS: AccessActions = {
  mailInvitation: null,
  inPersonInvitation: false,
  lacksMailAddress: false,
  vouchesForAge: false,
  recovery: false,
  lock: null,
};

const hasAccount = (access: PersonAccess): boolean =>
  access.state === 'active' || access.state === 'disabled';

const hasAddress = (email: string | null): boolean => email !== null && email.trim() !== '';

const isInvitable = (access: PersonAccess): boolean =>
  access.reason === null || (access.reason === 'noBirthDate' && access.rights.canManageAccount);

const invitationActsOf = (access: PersonAccess, email: string | null): AccessActions => {
  if (!access.rights.canInvite || !isInvitable(access)) {
    return NO_ACTIONS;
  }

  const isReissue = access.invitation !== null || access.state === 'invited';
  const canBeMailed = hasAddress(email);
  const mailAct: MailInvitationAct = isReissue ? 'reinvite' : 'invite';

  return {
    ...NO_ACTIONS,
    mailInvitation: canBeMailed ? mailAct : null,
    inPersonInvitation: true,
    lacksMailAddress: !canBeMailed,
    vouchesForAge: access.reason === 'noBirthDate',
  };
};

const accountActsOf = (access: PersonAccess, isOwnAccount: boolean): AccessActions => {
  if (!access.rights.canManageAccount) {
    return NO_ACTIONS;
  }
  if (access.state === 'disabled') {
    return { ...NO_ACTIONS, lock: 'enable' };
  }

  return { ...NO_ACTIONS, recovery: true, lock: isOwnAccount ? null : 'disable' };
};

export const accessActionsOf = ({
  access,
  email,
  isOwnAccount,
}: AccessActionsInput): AccessActions =>
  hasAccount(access) ? accountActsOf(access, isOwnAccount) : invitationActsOf(access, email);

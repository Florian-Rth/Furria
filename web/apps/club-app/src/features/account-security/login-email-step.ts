export interface PendingLoginEmail {
  loginEmail: string;
  updateContactEmail: boolean;
  expiresAt: string;
}

export type LoginEmailStep = { kind: 'address' } | ({ kind: 'code' } & PendingLoginEmail);

export const toLoginEmailStep = (
  pending: PendingLoginEmail | null,
  loginEmailRefused: boolean,
): LoginEmailStep => {
  if (pending === null || loginEmailRefused) {
    return { kind: 'address' };
  }

  return { kind: 'code', ...pending };
};

const toComparable = (email: string): string => email.trim().toLowerCase();

export const isCurrentLoginEmail = (typed: string, current: string): boolean =>
  toComparable(typed) === toComparable(current);

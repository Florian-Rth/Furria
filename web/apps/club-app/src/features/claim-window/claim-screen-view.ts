import type { WindowClaimOutcome, WindowClaimResult } from './schemas';

export type WindowClaimAnswer = Exclude<WindowClaimOutcome, 'invited' | 'closed'>;

export type ClaimScreenView =
  | { kind: 'checking' }
  | { kind: 'closed' }
  | { kind: 'form' }
  | { kind: 'entering' }
  | { kind: 'answer'; answer: WindowClaimAnswer };

export const claimScreenViewOf = (
  isOpen: boolean | null,
  result: WindowClaimResult | undefined,
): ClaimScreenView => {
  if (result !== undefined) {
    switch (result.outcome) {
      case 'invited':
        return { kind: 'entering' };
      case 'closed':
        return { kind: 'closed' };
      default:
        return { kind: 'answer', answer: result.outcome };
    }
  }
  if (isOpen === null) {
    return { kind: 'checking' };
  }

  return isOpen ? { kind: 'form' } : { kind: 'closed' };
};

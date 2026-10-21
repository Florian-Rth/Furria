export type InstallPhase = 'guide' | 'installing' | 'installed' | 'elsewhere';

export type PromptOutcome = 'none' | 'accepted' | 'dismissed';

export interface InstallPhaseInput {
  promptOutcome: PromptOutcome;
  hasInstalledNow: boolean;
  hasConfirmedNow: boolean;
  isKnownInstalled: boolean;
  wasConfirmed: boolean;
  isGuideReopened: boolean;
}

export const installPhaseOf = ({
  promptOutcome,
  hasInstalledNow,
  hasConfirmedNow,
  isKnownInstalled,
  wasConfirmed,
  isGuideReopened,
}: InstallPhaseInput): InstallPhase => {
  if (hasInstalledNow || hasConfirmedNow) {
    return 'installed';
  }
  if (promptOutcome === 'accepted') {
    return 'installing';
  }
  if ((isKnownInstalled || wasConfirmed) && !isGuideReopened) {
    return 'elsewhere';
  }
  return 'guide';
};

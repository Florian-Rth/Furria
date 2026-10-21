import { browserExitHrefOf } from '../browser-exit';
import {
  ELSEWHERE_LEAD,
  EXIT_HEADLINES,
  EXIT_LEAD,
  GUIDE_HEADLINE,
  INSTALLED_LEAD,
  INSTALLING_LEAD,
  PHASE_HEADLINES,
  PROMPT_FACTS,
  stepFactsOf,
  targetLabelOf,
} from '../install-copy';
import type { InstallGuide } from '../install-guide';
import type { InstallPhase } from '../install-phase';
import type { InstallFlow } from './use-install-flow';
import { useInstallFlow } from './use-install-flow';
import type { SecretUnlock } from './use-secret-unlock';
import { useSecretUnlock } from './use-secret-unlock';

interface InstallHeadline {
  line1: string;
  line2: string;
}

export interface InstallScreenModel {
  flow: InstallFlow;
  secret: SecretUnlock;
  headline: InstallHeadline;
  lead: string | null;
  facts: string | null;
  targetLabel: string;
  celebrationKey: number;
  exitHref: string | null;
}

const PHASE_LEADS: Record<Exclude<InstallPhase, 'guide'>, string> = {
  installing: INSTALLING_LEAD,
  installed: INSTALLED_LEAD,
  elsewhere: ELSEWHERE_LEAD,
};

const headlineOf = (phase: InstallPhase, guide: InstallGuide): InstallHeadline => {
  if (phase !== 'guide') {
    return PHASE_HEADLINES[phase];
  }
  return guide.kind === 'escape' ? EXIT_HEADLINES[guide.exit] : GUIDE_HEADLINE;
};

const leadOf = (phase: InstallPhase, guide: InstallGuide): string | null => {
  if (phase !== 'guide') {
    return PHASE_LEADS[phase];
  }
  return guide.kind === 'escape' ? EXIT_LEAD : null;
};

const factsOf = (phase: InstallPhase, guide: InstallGuide): string | null => {
  if (phase !== 'guide' || guide.kind === 'escape') {
    return null;
  }
  return guide.kind === 'prompt' ? PROMPT_FACTS : stepFactsOf(guide.steps.length);
};

const INSTALLED_BURST = 1;
const UNLOCKED_BURST = 2;

export const useInstallScreen = (): InstallScreenModel => {
  const flow = useInstallFlow();
  const secret = useSecretUnlock();
  const { phase, guide, target } = flow;
  const installedBurst = phase === 'installed' ? INSTALLED_BURST : 0;
  const unlockedBurst = secret.isUnlocked ? UNLOCKED_BURST : 0;
  const exitHref =
    guide.kind === 'escape' ? browserExitHrefOf(guide.exit, window.location.href) : null;

  return {
    flow,
    secret,
    headline: headlineOf(phase, guide),
    lead: leadOf(phase, guide),
    facts: factsOf(phase, guide),
    targetLabel: targetLabelOf(target),
    celebrationKey: installedBurst + unlockedBurst,
    exitHref,
  };
};

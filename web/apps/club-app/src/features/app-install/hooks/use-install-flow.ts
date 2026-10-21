import { useState, useSyncExternalStore } from 'react';
import type { InstallTarget } from '../install-browser';
import { readInstallTarget } from '../install-environment';
import type { InstallGuide } from '../install-guide';
import { installGuideOf } from '../install-guide';
import { readInstallConfirmed, rememberInstallConfirmed } from '../install-memory';
import type { InstallPhase, PromptOutcome } from '../install-phase';
import { installPhaseOf } from '../install-phase';
import {
  forgetInstallPrompt,
  readAppInstalled,
  readInstallPrompt,
  subscribeToInstall,
} from '../install-prompt-store';
import { useInstalledElsewhere } from './use-installed-elsewhere';

const noPrompt = (): BeforeInstallPromptEvent | null => null;
const notInstalled = (): boolean => false;

export interface InstallFlow {
  target: InstallTarget;
  guide: InstallGuide;
  phase: InstallPhase;
  install: () => void;
  confirmDone: () => void;
  reopenGuide: () => void;
}

export const useInstallFlow = (): InstallFlow => {
  const prompt = useSyncExternalStore(subscribeToInstall, readInstallPrompt, noPrompt);
  const hasInstalledNow = useSyncExternalStore(subscribeToInstall, readAppInstalled, notInstalled);
  const isKnownInstalled = useInstalledElsewhere();
  const [target] = useState(readInstallTarget);
  const [wasConfirmed] = useState(readInstallConfirmed);
  const [promptOutcome, setPromptOutcome] = useState<PromptOutcome>('none');
  const [hasConfirmedNow, setHasConfirmedNow] = useState(false);
  const [isGuideReopened, setIsGuideReopened] = useState(false);

  const guide = installGuideOf(target, prompt !== null);
  const phase = installPhaseOf({
    promptOutcome,
    hasInstalledNow,
    hasConfirmedNow,
    isKnownInstalled,
    wasConfirmed,
    isGuideReopened,
  });

  const install = (): void => {
    if (prompt === null) {
      return;
    }
    void prompt.prompt();
    void prompt.userChoice.then(({ outcome }) => {
      forgetInstallPrompt();
      setPromptOutcome(outcome);
    });
  };

  const confirmDone = (): void => {
    rememberInstallConfirmed();
    setHasConfirmedNow(true);
  };

  const reopenGuide = (): void => {
    setIsGuideReopened(true);
    setHasConfirmedNow(false);
  };

  return { target, guide, phase, install, confirmDone, reopenGuide };
};

import type { InstallSystem } from '@/features/app-install/install-browser';

export type PushReadiness = 'unsupported' | 'install-first' | 'blocked' | 'off' | 'on';

export interface PushTraits {
  canPush: boolean;
  system: InstallSystem;
  standalone: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}

export const pushReadinessOf = (traits: PushTraits): PushReadiness => {
  if (!traits.canPush) {
    return traits.system === 'ios' && !traits.standalone ? 'install-first' : 'unsupported';
  }
  if (traits.permission === 'denied') {
    return 'blocked';
  }

  return traits.subscribed && traits.permission === 'granted' ? 'on' : 'off';
};

import { usePushReadinessQuery, usePushSwitchMutation } from '../api';
import { askPushPermission } from '../push-device';
import type { PushReadiness } from '../push-readiness';

export interface PushSwitchControl {
  readiness: PushReadiness | undefined;
  isOn: boolean;
  toggle: (on: boolean) => void;
  isSwitching: boolean;
}

export const usePushSwitch = (): PushSwitchControl => {
  const readiness = usePushReadinessQuery();
  const mutation = usePushSwitchMutation();
  const pending = mutation.isPending ? mutation.variables : undefined;

  const toggle = (on: boolean): void => {
    if (on) {
      mutation.mutate({ on: true, permission: askPushPermission() });
      return;
    }
    mutation.mutate({ on: false });
  };

  return {
    readiness: readiness.data,
    isOn: pending === undefined ? readiness.data === 'on' : pending.on,
    toggle,
    isSwitching: mutation.isPending,
  };
};

import { usePushReadinessQuery, usePushSwitchMutation } from '../api';
import { PUSH_READINESS_NOTES } from '../push-copy';
import { askPushPermission } from '../push-device';
import type { PushReadiness } from '../push-readiness';

export interface PushSwitchControl {
  readiness: PushReadiness | undefined;
  note: string | undefined;
  isOn: boolean;
  toggle: (on: boolean) => void;
  isSwitching: boolean;
}

export const usePushSwitch = (): PushSwitchControl => {
  const readiness = usePushReadinessQuery();
  const mutation = usePushSwitchMutation();
  const pending = mutation.isPending ? mutation.variables : undefined;

  const toggle = (on: boolean): void => {
    if (mutation.isPending) {
      return;
    }
    if (on) {
      mutation.mutate({ on: true, permission: askPushPermission() });
      return;
    }
    mutation.mutate({ on: false });
  };

  return {
    readiness: readiness.data,
    note: readiness.data === undefined ? undefined : PUSH_READINESS_NOTES[readiness.data],
    isOn: pending === undefined ? readiness.data === 'on' : pending.on,
    toggle,
    isSwitching: mutation.isPending,
  };
};

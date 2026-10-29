import { useRunningOrderQuery } from '@/features/running-order/api';
import { toRunningOrderErrorMessage } from '../events-messages';
import type { RunningOrderPresence } from '../pane-actions';
import type { RunningOrderChecks } from '../running-order-step';
import { runningOrderChecksOf } from '../running-order-step';
import { useEventsWorkbench } from './use-events-workbench';

export type RunningOrderStep =
  | { kind: 'denied' }
  | { kind: 'loading' }
  | { kind: 'failed'; message: string; retrying: boolean; retry: () => void }
  | { kind: 'none' }
  | { kind: 'planned'; checks: RunningOrderChecks };

export interface RunningOrderStepState {
  step: RunningOrderStep;
  presence: RunningOrderPresence;
}

export const useRunningOrderStep = (eventId: number, active: boolean): RunningOrderStepState => {
  const { isUndecided, plansRunningOrder } = useEventsWorkbench();
  const query = useRunningOrderQuery(active && plansRunningOrder ? eventId : null);
  const message = toRunningOrderErrorMessage(query.error);

  if (isUndecided) {
    return { step: { kind: 'loading' }, presence: 'hidden' };
  }
  if (!plansRunningOrder) {
    return { step: { kind: 'denied' }, presence: 'hidden' };
  }
  if (query.data === null) {
    return { step: { kind: 'none' }, presence: 'none' };
  }
  if (query.data !== undefined) {
    return {
      step: { kind: 'planned', checks: runningOrderChecksOf(query.data) },
      presence: 'exists',
    };
  }
  if (message === null) {
    return { step: { kind: 'loading' }, presence: 'hidden' };
  }

  const retry = (): void => {
    void query.refetch();
  };

  return {
    step: { kind: 'failed', message, retrying: query.isFetching, retry },
    presence: 'hidden',
  };
};

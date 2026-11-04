import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { queryKeys } from '@/lib/query/reads';
import {
  PUSH_PERMISSION_REFUSED,
  PUSH_SWITCH_FAILED,
  PUSH_SWITCHED_OFF,
  PUSH_SWITCHED_ON,
  testPushNoticeOf,
} from './push-copy';
import {
  PushPermissionRefusedError,
  readPushTraits,
  subscribeThisDevice,
  unsubscribeThisDevice,
} from './push-device';
import type { PushReadiness } from './push-readiness';
import { pushReadinessOf } from './push-readiness';
import { requestTestPush } from './requests';
import type { TestPushResult } from './schemas';
import { testPushReportOf } from './test-push-report';

export type PushSwitch = { on: true; permission: Promise<NotificationPermission> } | { on: false };

const readPushReadiness = async (): Promise<PushReadiness> =>
  pushReadinessOf(await readPushTraits());

const switchThisDevice = (input: PushSwitch, accessToken: string): Promise<void> =>
  input.on
    ? subscribeThisDevice(input.permission, accessToken)
    : unsubscribeThisDevice(accessToken);

const switchedNotice = (input: PushSwitch): string =>
  input.on ? PUSH_SWITCHED_ON : PUSH_SWITCHED_OFF;

const switchFailureNotice = (error: Error): string =>
  error instanceof PushPermissionRefusedError ? PUSH_PERMISSION_REFUSED : PUSH_SWITCH_FAILED;

const testPushNotice = (_input: undefined, result: TestPushResult): KkNoticeRequest =>
  testPushNoticeOf(testPushReportOf(result.delivery), result.delivery);

export const usePushReadinessQuery = (): UseQueryResult<PushReadiness, Error> =>
  useQuery({
    queryKey: queryKeys.pushDevice,
    queryFn: readPushReadiness,
    retry: false,
    refetchOnWindowFocus: true,
  });

export const usePushSwitchMutation = (): UseMutationResult<void, Error, PushSwitch> =>
  useApiMutation({
    request: switchThisDevice,
    changes: ['pushDevice'],
    notice: { success: switchedNotice, failure: switchFailureNotice },
  });

export const useTestPushMutation = (): UseMutationResult<TestPushResult, Error, undefined> =>
  useApiMutation({ request: requestTestPush, changes: [], notice: { success: testPushNotice } });

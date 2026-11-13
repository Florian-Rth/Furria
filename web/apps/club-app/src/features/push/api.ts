import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { isPushAskOwed } from './push-ask';
import { readPushAskAnswered } from './push-ask-memory';
import {
  PUSH_PERMISSION_REFUSED,
  PUSH_SWITCH_FAILED,
  PUSH_SWITCHED_OFF,
  PUSH_SWITCHED_ON,
  PUSH_TOPIC_SWITCH_FAILED,
  TEST_PUSH_FAILED,
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
import { withTopicSwitched } from './push-topics';
import { requestPushTopicSwitch, requestPushTopics, requestTestPush } from './requests';
import type { PushTopicSetting, PushTopics, TestPushResult } from './schemas';
import { testPushReportOf } from './test-push-report';

export type PushSwitch = { on: true; permission: Promise<NotificationPermission> } | { on: false };

const readPushReadiness = async (): Promise<PushReadiness> =>
  pushReadinessOf(await readPushTraits());

const readPushAskOwed = async (): Promise<boolean> =>
  isPushAskOwed(await readPushTraits(), readPushAskAnswered());

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
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

export const usePushSwitchMutation = (): UseMutationResult<void, Error, PushSwitch> =>
  useApiMutation({
    request: switchThisDevice,
    changes: ['pushDevice'],
    notice: { success: switchedNotice, failure: switchFailureNotice },
  });

export const useTestPushMutation = (): UseMutationResult<TestPushResult, Error, undefined> =>
  useApiMutation({
    request: requestTestPush,
    changes: [],
    notice: { success: testPushNotice, failure: () => TEST_PUSH_FAILED },
  });

export const usePushAskQuery = (): UseQueryResult<boolean, Error> =>
  useQuery({
    queryKey: queryKeys.pushAsk,
    queryFn: readPushAskOwed,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

export const usePushTopicsQuery = (enabled = true): UseQueryResult<PushTopics, Error> =>
  useQuery({
    queryKey: queryKeys.pushTopics,
    queryFn: () => withFreshAccessToken(requestPushTopics),
    enabled,
  });

export const usePushTopicSwitchMutation = (): UseMutationResult<void, Error, PushTopicSetting> =>
  useApiMutation({
    request: requestPushTopicSwitch,
    optimistic: [optimisticPatch(queryKeys.pushTopics, withTopicSwitched)],
    changes: ['pushDevice'],
    notice: { failure: () => PUSH_TOPIC_SWITCH_FAILED },
  });

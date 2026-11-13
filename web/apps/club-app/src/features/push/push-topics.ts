import type { PushTopicSetting, PushTopics } from './schemas';

export type PushTopicsTally =
  | { kind: 'all' }
  | { kind: 'none' }
  | { kind: 'some'; enabled: number; total: number };

export const withTopicSwitched = (
  current: PushTopics | undefined,
  { topic, isEnabled }: PushTopicSetting,
): PushTopics | undefined =>
  current === undefined
    ? current
    : {
        topics: current.topics.map((setting) =>
          setting.topic === topic ? { topic, isEnabled } : setting,
        ),
      };

export const pushTopicsTallyOf = (settings: readonly PushTopicSetting[]): PushTopicsTally => {
  const enabled = settings.filter((setting) => setting.isEnabled).length;
  if (enabled === settings.length) {
    return { kind: 'all' };
  }

  return enabled === 0 ? { kind: 'none' } : { kind: 'some', enabled, total: settings.length };
};

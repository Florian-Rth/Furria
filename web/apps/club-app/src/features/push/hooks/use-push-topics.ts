import { usePushTopicSwitchMutation, usePushTopicsQuery } from '../api';
import { PUSH_TOPIC_COPY, pushTopicsTallyLabelOf } from '../push-copy';
import { pushTopicsTallyOf } from '../push-topics';
import type { PushTopic, PushTopicSetting } from '../schemas';

export interface PushTopicRow {
  topic: PushTopic;
  label: string;
  description: string;
  isEnabled: boolean;
}

export interface PushTopicsControl {
  rows: PushTopicRow[];
  tallyLabel: string | undefined;
  hearsNothing: boolean;
  toggle: (topic: PushTopic, isEnabled: boolean) => void;
}

const rowOf = (setting: PushTopicSetting): PushTopicRow => ({
  ...PUSH_TOPIC_COPY[setting.topic],
  topic: setting.topic,
  isEnabled: setting.isEnabled,
});

export const usePushTopics = (): PushTopicsControl => {
  const topics = usePushTopicsQuery();
  const mutation = usePushTopicSwitchMutation();
  const settings = topics.data?.topics;

  const toggle = (topic: PushTopic, isEnabled: boolean): void => {
    mutation.mutate({ topic, isEnabled });
  };

  return {
    rows: settings === undefined ? [] : settings.map(rowOf),
    tallyLabel:
      settings === undefined || settings.length === 0
        ? undefined
        : pushTopicsTallyLabelOf(pushTopicsTallyOf(settings)),
    hearsNothing: settings?.length === 0,
    toggle,
  };
};

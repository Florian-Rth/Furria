import { useNotifyReachQuery } from '../api';
import { toAudienceGroupIds, toAudiencePersonIds } from '../calendar-authoring';
import type { NotifyReachQuery } from '../notify-reach';
import { isAskableReach } from '../notify-reach';
import type { CalendarEntryForm } from '../schemas';

type NotifiedForm = Pick<
  CalendarEntryForm,
  'kind' | 'audience' | 'audienceGroupIds' | 'audiencePersonIds'
>;

const toReachQuery = (form: NotifiedForm): NotifyReachQuery => ({
  kind: form.kind,
  audience: form.audience,
  audienceGroupIds: toAudienceGroupIds(form),
  audiencePersonIds: toAudiencePersonIds(form),
});

export const useNotifyReachCount = (form: NotifiedForm, isOffered: boolean): number | null => {
  const query = toReachQuery(form);
  const reach = useNotifyReachQuery(isOffered && isAskableReach(query) ? query : null);

  return reach.data?.people ?? null;
};

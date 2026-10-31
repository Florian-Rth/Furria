import type { KkLinkSearchValues } from '@furria/ui/kk-link-search';
import { useState } from 'react';
import type { UsualTrainingTime } from '../schemas';
import { toNextTrainingDraft } from '../usual-training';

const HUB_RETURN = 'group';

export const useTrainingPlanSearch = (
  groupId: number,
  usualTimes: readonly UsualTrainingTime[],
): KkLinkSearchValues => {
  const [now] = useState(() => new Date());
  const draft = { ...toNextTrainingDraft(groupId, usualTimes, now), back: HUB_RETURN };

  return Object.fromEntries(
    Object.entries(draft).filter(
      (pair): pair is [string, string | number] => pair[1] !== undefined,
    ),
  );
};

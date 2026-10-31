import type { GroupAct, MyAct } from '@/features/acts/schemas';
import type { AnswerKey, HubBand } from './act-card-model';
import { hubBandOf, isOwed } from './act-card-model';

export interface OwnHubActs {
  mine: MyAct[];
  others: GroupAct[];
}

export type HubCellTone = 'strong' | 'secondary' | 'attention' | 'positive';

export interface HubActCard {
  act: MyAct;
  band: HubBand;
  owed: boolean;
  trainingTone: HubCellTone;
  practiceTone: HubCellTone;
}

const TRAINING_TONES: Record<AnswerKey, HubCellTone> = { yes: 'positive', no: 'secondary' };

const trainingToneOf = (owed: boolean, answer: AnswerKey | null): HubCellTone => {
  if (owed) {
    return 'attention';
  }

  return answer === null ? 'strong' : TRAINING_TONES[answer];
};

export const ownHubActsOf = (
  mine: readonly MyAct[],
  group: readonly GroupAct[],
  groupId: number,
  sessionYear: number | null,
): OwnHubActs => {
  const own = mine.filter((act) => act.group?.groupId === groupId);
  const ownIds = new Set(own.map((act) => act.actId));

  return {
    mine: own,
    others: group.filter(
      (act) =>
        !ownIds.has(act.actId) &&
        !act.closed &&
        (sessionYear === null || act.sessionYear === sessionYear),
    ),
  };
};

export const hubActCardOf = (act: MyAct): HubActCard => {
  const band = hubBandOf(act);
  const answer = band.training?.answer ?? null;
  const owed = band.training !== null && isOwed(act.viewerInCast, answer);

  return {
    act,
    band,
    owed,
    trainingTone: trainingToneOf(owed, answer),
    practiceTone: act.playable ? 'strong' : 'secondary',
  };
};

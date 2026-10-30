import type { MyAct } from '@/features/acts/schemas';
import type {
  PassCastMember,
  PassCastRole,
  PassPractice,
  PassSlot,
  PassTemplate,
  PassTraining,
} from './pass-act';
import {
  castRoleOf,
  passCastOf,
  passPracticeOf,
  passSlotOf,
  passTemplateOf,
  passTrainingOf,
} from './pass-act';

export interface PassCardModel {
  template: PassTemplate;
  slot: PassSlot;
  training: PassTraining;
  practice: PassPractice;
  cast: PassCastMember[];
  castRole: PassCastRole;
}

export const passCardOf = (act: MyAct, viewerId: number | null): PassCardModel => {
  const template = passTemplateOf(act.kind, act.playable);

  return {
    template,
    slot: passSlotOf(act.nextEvening),
    training: passTrainingOf(act.nextTraining, act.viewerInCast),
    practice: passPracticeOf(template, act.playable, act.editors, viewerId),
    cast: passCastOf(act.cast, viewerId),
    castRole: castRoleOf(act.kind),
  };
};

import { toLocalIsoDay, toTimeLabel } from '@/lib/calendar-days';
import type { UsualTraining } from './schemas';

export interface TrainingDraftSearch {
  day: string;
  group: number;
  kind: 'training';
  start?: string;
  end?: string;
  venue?: number;
}

export const toUsualTrainingDraft = (usual: UsualTraining): TrainingDraftSearch => ({
  day: toLocalIsoDay(usual.startsAt),
  group: usual.groupId,
  kind: 'training',
  start: toTimeLabel(usual.startsAt),
  end: toTimeLabel(usual.endsAt),
  venue: usual.venueId ?? undefined,
});

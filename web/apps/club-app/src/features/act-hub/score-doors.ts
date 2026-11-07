import type { ActViewer } from '@/features/acts/schemas';
import type { ScoreLink } from './score-links';
import {
  detailsLinkOf,
  editorLinkOf,
  eveningLinkOf,
  hallLinkOf,
  musicLinkOf,
  settingsLinkOf,
} from './score-links';

export type ScoreDoorKey = 'studio' | 'music' | 'evenings' | 'trainings' | 'hall' | 'settings';

export interface ScoreDoor {
  key: ScoreDoorKey;
  link: ScoreLink;
}

export interface ScoreDoorFacts {
  actId: number;
  nextEveningId: number | null;
  hallTrainingId: number | null;
  playable: boolean;
}

export const hasEditDoors = (viewer: ActViewer): boolean =>
  viewer.canEditStudio || viewer.canEditSettings;

export const scoreDoorsOf = (viewer: ActViewer, facts: ScoreDoorFacts): ScoreDoor[] => {
  if (!hasEditDoors(viewer)) {
    return [];
  }

  const { actId } = facts;
  const studio = viewer.canEditStudio;
  const doors: (ScoreDoor | null)[] = [
    studio ? { key: 'studio', link: editorLinkOf(actId) } : null,
    studio ? { key: 'music', link: musicLinkOf(actId) } : null,
    studio ? { key: 'evenings', link: eveningLinkOf(actId, facts.nextEveningId) } : null,
    studio || viewer.canMarkAttendance ? { key: 'trainings', link: detailsLinkOf(actId) } : null,
    facts.playable ? { key: 'hall', link: hallLinkOf(actId, facts.hallTrainingId) } : null,
    viewer.canEditSettings ? { key: 'settings', link: settingsLinkOf(actId) } : null,
  ];

  return doors.filter((door) => door !== null);
};

import type { ActViewer } from '@/features/acts/schemas';
import type { ScoreLink } from './score-links';
import { detailsLinkOf, editorLinkOf, musicLinkOf, settingsLinkOf } from './score-links';

export type ScoreDoorKey = 'studio' | 'music' | 'details' | 'settings';

export interface ScoreDoor {
  key: ScoreDoorKey;
  link: ScoreLink;
}

export const hasEditDoors = (viewer: ActViewer): boolean =>
  viewer.canEditStudio || viewer.canEditSettings;

export const scoreDoorsOf = (viewer: ActViewer, actId: number): ScoreDoor[] => {
  if (!hasEditDoors(viewer)) {
    return [];
  }

  const studio = viewer.canEditStudio;
  const doors: (ScoreDoor | null)[] = [
    studio ? { key: 'studio', link: editorLinkOf(actId) } : null,
    studio ? { key: 'music', link: musicLinkOf(actId) } : null,
    studio ? { key: 'details', link: detailsLinkOf(actId) } : null,
    viewer.canEditSettings ? { key: 'settings', link: settingsLinkOf(actId) } : null,
  ];

  return doors.filter((door) => door !== null);
};

import { softenedTracksOf } from '@furria/studio/stage-writes';
import type { StudioChange } from '@furria/studio/studio-changes';
import type { StudioScreen } from '@furria/studio/studio-screen';

export const softScreenOf = (screen: StudioScreen): StudioScreen => {
  const { stageDocument, studio } = screen;
  const softened = (change: StudioChange): StudioChange =>
    change.kind === 'tracks'
      ? {
          kind: 'tracks',
          tracks: softenedTracksOf(studio.choreography?.tracks ?? [], change.tracks),
        }
      : change;

  return {
    ...screen,
    stageDocument: {
      ...stageDocument,
      change: (change) => {
        stageDocument.change(softened(change));
      },
    },
  };
};

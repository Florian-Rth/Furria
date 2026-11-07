import { newPartNameOf, STUDIO_MAIN_VIDEO_NONE, videoNameOf } from '@furria/studio/studio-copy';
import type { StudioPart } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { PartDeskAnchor, PartSettings, PartShift } from '@furria/studio/studio-steps';
import { deskPartOf, partSettingsOf, partShiftOf, startsAPart } from '@furria/studio/studio-steps';
import { useState } from 'react';

export interface StepDeskVideo {
  key: string;
  text: string;
  variant: 'contained' | 'outlined';
  press: () => void;
}

export interface StepDeskPart {
  name: string;
  leads: boolean;
  shiftLocked: Record<PartShift, boolean>;
  videos: StepDeskVideo[];
  rename: (name: string) => void;
  commitName: () => void;
  shift: (direction: PartShift) => void;
}

export interface StepDesk {
  part: StepDeskPart | null;
  openPart: () => void;
}

interface Draft {
  partId: number;
  name: string;
}

const NO_VIDEO_KEY = 'none';

export const useStepDesk = (screen: StudioScreen): StepDesk | null => {
  const { playback, practice, studio } = screen;
  const work = screen.document;
  const { steps, parts } = playback;
  const step = practice.step;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [anchor, setAnchor] = useState<PartDeskAnchor | null>(null);
  if (anchor !== null && anchor.stepId !== step?.stepId) {
    setAnchor(null);
  }
  const part = step === null ? null : deskPartOf(parts, step.stepId, anchor);

  if (step === null) {
    return null;
  }

  const settle = (target: StudioPart, change: Partial<PartSettings>): void => {
    work.change({
      kind: 'partSettings',
      partId: target.partId,
      ...partSettingsOf(target),
      ...change,
    });
  };
  const commitDraft = (): void => {
    const edited = parts.find((candidate) => candidate.partId === draft?.partId);
    const trimmed = draft?.name.trim() ?? '';
    setDraft(null);
    if (edited !== undefined && trimmed !== '' && trimmed !== edited.name) {
      settle(edited, { name: trimmed });
    }
  };
  const partDeskOf = (target: StudioPart): StepDeskPart => {
    const shiftOf = (direction: PartShift) => partShiftOf(steps, parts, target.partId, direction);
    const name = draft?.partId === target.partId ? draft.name : target.name;
    const videoOf = (videoId: number | null, text: string): StepDeskVideo => ({
      key: videoId === null ? NO_VIDEO_KEY : String(videoId),
      text,
      variant: target.mainVideoId === videoId ? 'contained' : 'outlined',
      press: () => {
        settle(target, { mainVideoId: videoId });
      },
    });

    return {
      name,
      leads: startsAPart([target], step.stepId) || anchor?.stepId === step.stepId,
      shiftLocked: { earlier: shiftOf('earlier') === null, later: shiftOf('later') === null },
      videos: [
        videoOf(null, STUDIO_MAIN_VIDEO_NONE),
        ...studio.videos.map((video, index) =>
          videoOf(video.videoId, videoNameOf(video.name, index + 1)),
        ),
      ],
      rename: (value) => {
        setDraft({ partId: target.partId, name: value });
      },
      commitName: () => {
        commitDraft();
      },
      shift: (direction) => {
        const ranges = shiftOf(direction);
        if (ranges === null) {
          return;
        }
        setAnchor({ stepId: step.stepId, partId: target.partId });
        work.startGesture();
        for (const range of ranges) {
          const moved = parts.find((candidate) => candidate.partId === range.partId);
          if (moved !== undefined) {
            settle(moved, { firstStepId: range.firstStepId, lastStepId: range.lastStepId });
          }
        }
        work.endGesture();
      },
    };
  };

  return {
    part: part === null ? null : partDeskOf(part),
    openPart: () => {
      setAnchor(null);
      work.addPart(step.stepId, newPartNameOf(parts.length + 1));
    },
  };
};

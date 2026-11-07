import { stepNumberOf } from '@furria/studio/step-names';
import {
  newPartNameOf,
  partDeskTitleOf,
  STUDIO_MAIN_VIDEO_NONE,
  stepDeskTitleOf,
  videoNameOf,
} from '@furria/studio/studio-copy';
import type { StudioPart } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { PartDeskAnchor, PartSettings, PartShift } from '@furria/studio/studio-steps';
import { deskPartOf, partSettingsOf, partShiftOf, startsAPart } from '@furria/studio/studio-steps';
import type { ActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import { useState } from 'react';

export interface StepDeskVideo {
  key: string;
  text: string;
  variant: 'contained' | 'outlined';
  press: () => void;
}

export interface StepDeskPart {
  title: string;
  name: string;
  leads: boolean;
  shiftLocked: Record<PartShift, boolean>;
  removing: boolean;
  videos: StepDeskVideo[];
  rename: (name: string) => void;
  commitName: () => void;
  shift: (direction: PartShift) => void;
  remove: () => void;
}

export interface StepDesk {
  title: string;
  removing: boolean;
  part: StepDeskPart | null;
  canOpenPart: boolean;
  remove: () => void;
  openPart: () => void;
}

interface Draft {
  partId: number;
  name: string;
}

const NO_VIDEO_KEY = 'none';

export const useStepDesk = (screen: StudioScreen, tool: ActStudioStepTool): StepDesk | null => {
  const { playback, practice, studio } = screen;
  const work = screen.document;
  const { steps, parts } = playback;
  const step =
    tool.deskStepId === null
      ? practice.step
      : (steps.find((candidate) => candidate.stepId === tool.deskStepId) ?? null);
  const [removingStepId, setRemovingStepId] = useState<number | null>(null);
  const [removingPartId, setRemovingPartId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [anchor, setAnchor] = useState<PartDeskAnchor | null>(null);
  if (anchor !== null && (!tool.deskOpen || anchor.stepId !== step?.stepId)) {
    setAnchor(null);
  }
  const part = step === null ? null : deskPartOf(parts, step.stepId, anchor);
  if (removingStepId !== null && (!tool.deskOpen || step?.stepId !== removingStepId)) {
    setRemovingStepId(null);
  }
  if (removingPartId !== null && (!tool.deskOpen || part?.partId !== removingPartId)) {
    setRemovingPartId(null);
  }

  if (step === null) {
    return null;
  }

  const number = stepNumberOf(steps, step.stepId);
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
    const numbers = target.stepIds
      .map((stepId) => stepNumberOf(steps, stepId))
      .filter((position) => position > 0);
    const videoOf = (videoId: number | null, text: string): StepDeskVideo => ({
      key: videoId === null ? NO_VIDEO_KEY : String(videoId),
      text,
      variant: target.mainVideoId === videoId ? 'contained' : 'outlined',
      press: () => {
        settle(target, { mainVideoId: videoId });
      },
    });

    return {
      title: partDeskTitleOf(
        target.name,
        Math.min(...numbers, number),
        Math.max(...numbers, number),
      ),
      name,
      leads: startsAPart([target], step.stepId) || anchor?.stepId === step.stepId,
      shiftLocked: { earlier: shiftOf('earlier') === null, later: shiftOf('later') === null },
      removing: removingPartId === target.partId,
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
      remove: () => {
        if (removingPartId !== target.partId) {
          setRemovingPartId(target.partId);
          return;
        }
        setRemovingPartId(null);
        work.change({ kind: 'partRemove', partId: target.partId });
      },
    };
  };

  return {
    title: stepDeskTitleOf(number, step.name),
    removing: removingStepId === step.stepId,
    part: part === null ? null : partDeskOf(part),
    canOpenPart: !startsAPart(parts, step.stepId),
    remove: () => {
      if (removingStepId !== step.stepId) {
        setRemovingStepId(step.stepId);
        return;
      }
      setRemovingStepId(null);
      tool.closeDesk();
      work.change({ kind: 'stepRemove', stepId: step.stepId });
    },
    openPart: () => {
      setAnchor(null);
      work.addPart(step.stepId, newPartNameOf(parts.length + 1));
    },
  };
};

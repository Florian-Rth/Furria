import { useState } from 'react';
import type { StudioPart } from '@/features/acts/schemas';
import {
  newPartNameOf,
  STUDIO_MAIN_VIDEO_NONE,
  stepDeskTitleOf,
  videoNameOf,
} from '../studio-copy';
import type { PartSettings, PartShift } from '../studio-steps';
import { partBorderStepOf, partOfStep, partSettingsOf, startsAPart } from '../studio-steps';
import type { ActStudioStepTool } from './use-act-studio-step-tool';
import type { StudioScreen } from './use-studio-screen';

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
  const { manual, playback, practice, studio } = screen;
  const { steps, parts } = playback;
  const step = practice.step;
  const [removingStepId, setRemovingStepId] = useState<number | null>(null);
  const [removingPartId, setRemovingPartId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const part = step === null ? null : partOfStep(parts, step.stepId);
  if (removingStepId !== null && (!tool.deskOpen || step?.stepId !== removingStepId)) {
    setRemovingStepId(null);
  }
  if (removingPartId !== null && (!tool.deskOpen || part?.partId !== removingPartId)) {
    setRemovingPartId(null);
  }

  if (step === null) {
    return null;
  }

  const number = steps.findIndex((candidate) => candidate.stepId === step.stepId) + 1;
  const settle = (target: StudioPart, change: Partial<PartSettings>): void => {
    manual.settlePart.mutate({
      partId: target.partId,
      settings: { ...partSettingsOf(target), ...change },
    });
  };
  const commitDraft = (): void => {
    const edited = parts.find((candidate) => candidate.partId === draft?.partId);
    const trimmed = draft?.name.trim() ?? '';
    if (draft === null || edited === undefined || trimmed === '' || trimmed === edited.name) {
      setDraft(null);
      return;
    }
    const clear = (): void => {
      setDraft((current) => (current === draft ? null : current));
    };
    void manual.settlePart
      .mutateAsync({
        partId: edited.partId,
        settings: { ...partSettingsOf(edited), name: trimmed },
      })
      .then(clear, clear);
  };
  const partDeskOf = (target: StudioPart): StepDeskPart => {
    const borderOf = (direction: PartShift): number | null =>
      partBorderStepOf(steps, parts, target.partId, direction);
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
      leads: startsAPart([target], step.stepId),
      shiftLocked: { earlier: borderOf('earlier') === null, later: borderOf('later') === null },
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
        const firstStepId = borderOf(direction);
        if (firstStepId !== null) {
          settle(target, { firstStepId });
        }
      },
      remove: () => {
        if (removingPartId !== target.partId) {
          setRemovingPartId(target.partId);
          return;
        }
        setRemovingPartId(null);
        manual.removePart.mutate(target.partId);
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
      manual.remove.mutate(step.stepId);
    },
    openPart: () => {
      manual.addPart.mutate({ firstStepId: step.stepId, name: newPartNameOf(parts.length + 1) });
    },
  };
};

import type { PracticeStepGroupView } from '@/features/act-practice/hooks/use-practice-steps';
import type { ActStudioStepTool } from './use-act-studio-step-tool';
import type { StudioScreen } from './use-studio-screen';

export const useActStudioRail = (
  screen: StudioScreen,
  tool: ActStudioStepTool,
): PracticeStepGroupView[] => {
  const { steps, practice } = screen;

  return steps.groups.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({
      ...row,
      press: () => {
        if (row.current) {
          tool.openDesk();
          return;
        }
        practice.jumpTo(row.stepId);
      },
    })),
  }));
};

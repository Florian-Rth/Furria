import { useCalendarAuthoring } from './use-calendar-authoring';

export interface CalendarHelpViewer {
  isWide: boolean;
  mayAuthor: boolean;
  mayPlan: boolean;
}

export const useCalendarHelpViewer = (isWide: boolean): CalendarHelpViewer => {
  const { authoring } = useCalendarAuthoring();
  const ownerOptions = authoring?.ownerOptions ?? [];

  return {
    isWide,
    mayAuthor: authoring?.mayAuthor ?? false,
    mayPlan: ownerOptions.some((option) => option.ownerGroupId !== null),
  };
};

import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { ADD_LABEL } from '../calendar-agenda-copy';
import { useCalendarAuthoring } from './use-calendar-authoring';

export const useCalendarAdd = (day: string): KkScreenActions | undefined => {
  const { authoring } = useCalendarAuthoring();
  const navigate = useNavigate();

  if (authoring === null || !authoring.mayAuthor) {
    return undefined;
  }

  return [
    {
      id: 'calendar-add',
      label: ADD_LABEL,
      icon: 'add',
      emphasis: true,
      onSelect: () => {
        void navigate({ to: '/calendar/new', search: { day } });
      },
    },
  ];
};

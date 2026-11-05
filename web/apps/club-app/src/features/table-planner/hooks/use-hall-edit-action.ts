import type { KkQuietScreenAction } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { EDIT_HALL_LABEL } from '../table-planner-copy';

export const HALL_BUILDER_ROUTE = '/halls/$hallId';

export const useHallEditAction = (hallId: number | null): KkQuietScreenAction | null => {
  const navigate = useNavigate();

  if (hallId === null) {
    return null;
  }

  const params = { hallId: String(hallId) };

  return {
    id: 'edit-hall',
    label: EDIT_HALL_LABEL,
    icon: 'wall',
    link: { to: HALL_BUILDER_ROUTE, params },
    onSelect: () => {
      void navigate({ to: HALL_BUILDER_ROUTE, params });
    },
  };
};

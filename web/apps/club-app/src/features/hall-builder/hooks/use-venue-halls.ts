import { useNavigate } from '@tanstack/react-router';
import { useCreateHallMutation, useHallsQuery } from '@/features/hall-plan/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { toHallUpdatedMeta } from '../hall-builder-copy';
import { nextHallName } from '../hall-names';
import { HALL_PERMISSION_KEYS } from '../hall-permission';

export interface VenueHallRow {
  hallId: number;
  name: string;
  meta: string;
  href: string;
}

export interface VenueHalls {
  isVisible: boolean;
  isLoading: boolean;
  rows: readonly VenueHallRow[];
  isCreating: boolean;
  create: () => void;
}

export const useVenueHalls = (venueId: number): VenueHalls => {
  const permissions = usePermissions();
  const isVisible = HALL_PERMISSION_KEYS.some((key) => permissions.has(key));
  const halls = useHallsQuery(isVisible);
  const creation = useCreateHallMutation();
  const navigate = useNavigate();
  const own = (halls.data?.halls ?? []).filter((hall) => hall.venueId === venueId);
  const rows = own.map((hall) => ({
    hallId: hall.hallId,
    name: hall.name,
    meta: toHallUpdatedMeta(formatIsoDay(toIsoDay(new Date(hall.updatedAt)))),
    href: `/halls/${hall.hallId}`,
  }));

  const create = (): void => {
    creation.mutate(
      { venueId, name: nextHallName(own.map((hall) => hall.name)) },
      {
        onSuccess: (created) => {
          void navigate({ to: '/halls/$hallId', params: { hallId: String(created.hallId) } });
        },
      },
    );
  };

  return {
    isVisible,
    isLoading: isVisible && halls.data === undefined && halls.error === null,
    rows,
    isCreating: creation.isPending,
    create,
  };
};

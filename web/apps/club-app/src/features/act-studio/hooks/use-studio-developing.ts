import { useQueryClient } from '@tanstack/react-query';
import type { Studio } from '@/features/acts/schemas';
import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import { queryKeys } from '@/lib/query/reads';
import { isDevelopingStudio } from '../studio-videos';

export const useStudioDeveloping = (actId: number, studio: Studio): void => {
  const queryClient = useQueryClient();

  useDevelopingPicture({
    isDeveloping: isDevelopingStudio(studio),
    refresh: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.actStudio(actId) });
    },
    changes: ['media'],
  });
};

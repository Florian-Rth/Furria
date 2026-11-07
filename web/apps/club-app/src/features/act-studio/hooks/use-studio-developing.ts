import { isDevelopingStudio } from '@furria/studio/studio-videos';
import { useQueryClient } from '@tanstack/react-query';
import type { ActStudio } from '@/features/acts/schemas';
import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import { queryKeys } from '@/lib/query/reads';

export const useStudioDeveloping = (actId: number, studio: ActStudio): void => {
  const queryClient = useQueryClient();

  useDevelopingPicture({
    isDeveloping: isDevelopingStudio(studio),
    refresh: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.actStudio(actId) });
    },
    changes: ['media'],
  });
};

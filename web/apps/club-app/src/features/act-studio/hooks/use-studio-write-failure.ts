import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/reads';
import { studioFailureOf } from '../studio-failure';

export interface StudioWriteNotice {
  failure: (error: Error) => string | KkNoticeRequest | null;
}

export const useStudioWriteFailure = (actId: number): StudioWriteNotice => {
  const queryClient = useQueryClient();
  const reload = (): void => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.actStudio(actId) });
  };

  return { failure: (error) => studioFailureOf(error, reload) };
};

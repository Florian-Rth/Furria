import { useKkNotice } from '@furria/ui';
import type { QueryKey, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestToDoMark } from './requests';
import type { ToDoMark } from './to-do-board';
import { toToDoMarkErrorMessage } from './to-do-messages';

export interface ToDoMarkSurface<TData> {
  queryKey: QueryKey;
  withMark: (current: TData | undefined, mark: ToDoMark) => TData | undefined;
  alsoRefresh: readonly QueryKey[];
}

interface ToDoMarkRollback<TData> {
  previous: TData | undefined;
}

export const useToDoMarkMutation = <TData>(
  surface: ToDoMarkSurface<TData>,
): UseMutationResult<void, Error, ToDoMark, ToDoMarkRollback<TData>> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (mark: ToDoMark) =>
      withFreshAccessToken((accessToken) => requestToDoMark(mark, accessToken)),
    onMutate: async (mark) => {
      await queryClient.cancelQueries({ queryKey: surface.queryKey });
      const previous = queryClient.getQueryData<TData>(surface.queryKey);
      queryClient.setQueryData<TData>(surface.queryKey, (current) =>
        surface.withMark(current, mark),
      );

      return { previous };
    },
    onError: (error, _mark, context) => {
      queryClient.setQueryData(surface.queryKey, context?.previous);
      const message = toToDoMarkErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: surface.queryKey });
      for (const queryKey of surface.alsoRefresh) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
};

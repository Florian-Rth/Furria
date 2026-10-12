import type { QueryKey, UseMutationResult } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { requestToDoMark } from './requests';
import type { ToDoMark } from './to-do-board';
import { toToDoMarkErrorMessage } from './to-do-messages';

export interface ToDoMarkSurface<TData> {
  queryKey: QueryKey;
  withMark: (current: TData | undefined, mark: ToDoMark) => TData | undefined;
}

export const useToDoMarkMutation = <TData>(
  surface: ToDoMarkSurface<TData>,
): UseMutationResult<void, Error, ToDoMark> =>
  useApiMutation({
    request: requestToDoMark,
    optimistic: [optimisticPatch(surface.queryKey, surface.withMark)],
    changes: ['toDoMark'],
    notice: { failure: toToDoMarkErrorMessage },
  });

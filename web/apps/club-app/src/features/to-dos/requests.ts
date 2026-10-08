import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { ToDoMark } from './to-do-board';

const toDoSeenPath = (mark: ToDoMark): string => `/api/to-dos/${mark.kind}/seen`;

const requestToDoSeen = (mark: ToDoMark, accessToken: string): Promise<void> =>
  apiFetch(toDoSeenPath(mark), {
    method: 'PUT',
    body: { version: mark.version },
    schema: NoContentSchema,
    accessToken,
  });

const requestToDoUnseen = (mark: ToDoMark, accessToken: string): Promise<void> =>
  apiFetch(toDoSeenPath(mark), { method: 'DELETE', schema: NoContentSchema, accessToken });

export const requestToDoMark = (mark: ToDoMark, accessToken: string): Promise<void> =>
  mark.seen ? requestToDoSeen(mark, accessToken) : requestToDoUnseen(mark, accessToken);

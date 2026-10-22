import type { FC } from 'react';
import { ToDosPanel } from '@/features/to-dos/components/ToDosPanel';
import { useToDosBoard } from '@/features/to-dos/hooks/use-to-dos-board';
import type { ToDo } from '@/features/to-dos/schemas';
import { TICKET_REQUEST_TO_DO_SURFACE } from '../api';

interface TicketRequestToDosProps {
  toDo: ToDo;
}

export const TicketRequestToDos: FC<TicketRequestToDosProps> = ({ toDo }) => {
  const view = useToDosBoard([toDo], TICKET_REQUEST_TO_DO_SURFACE);

  return <ToDosPanel view={view} />;
};

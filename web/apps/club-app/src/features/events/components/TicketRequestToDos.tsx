import type { FC } from 'react';
import type { ToDo } from '@/features/to-dos';
import { ToDosPanel, useToDosBoard } from '@/features/to-dos';
import { TICKET_REQUEST_TO_DO_SURFACE } from '../api';

interface TicketRequestToDosProps {
  toDo: ToDo;
}

export const TicketRequestToDos: FC<TicketRequestToDosProps> = ({ toDo }) => {
  const view = useToDosBoard([toDo], TICKET_REQUEST_TO_DO_SURFACE);

  return <ToDosPanel view={view} />;
};

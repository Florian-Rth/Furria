import { useState } from 'react';

interface AppointRequest {
  groupId: number | null;
  token: number;
}

export interface AppointIntent {
  tokenFor: (groupId: number) => number | null;
  request: (groupId: number) => void;
}

const NO_REQUEST: AppointRequest = { groupId: null, token: 0 };

export const useAppointIntent = (): AppointIntent => {
  const [request, setRequest] = useState<AppointRequest>(NO_REQUEST);

  const tokenFor = (groupId: number): number | null =>
    request.groupId === groupId ? request.token : null;

  const ask = (groupId: number): void => {
    setRequest((previous) => ({ groupId, token: previous.token + 1 }));
  };

  return { tokenFor, request: ask };
};

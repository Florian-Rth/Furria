import { useMeQuery } from '../api';

export const MANAGING_LOGIN_NAME = 'Verwaltungszugang';

export const useSignerName = (): string => {
  const person = useMeQuery().data?.person ?? null;
  return person === null ? MANAGING_LOGIN_NAME : `${person.firstName} ${person.lastName}`;
};

import { format } from 'date-fns';

export const stampSignatureOf = (signer: string, iso: string): string => {
  const moment = new Date(iso);
  return `${signer} · ${format(moment, 'dd.MM.yyyy')} · ${format(moment, 'HH:mm')}`;
};

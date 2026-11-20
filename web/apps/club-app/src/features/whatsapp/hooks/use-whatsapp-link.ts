import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useWhatsAppPairingCodeMutation, useWhatsAppQrCodeQuery } from '../api';

export type WhatsAppQrRead =
  | { kind: 'loading' }
  | { kind: 'failed' }
  | { kind: 'shown'; value: string };

export interface WhatsAppLinkControl {
  qr: WhatsAppQrRead;
  phoneNumber: string;
  changePhoneNumber: (event: ChangeEvent<HTMLInputElement>) => void;
  canRequest: boolean;
  pairingCode: string | null;
  isRequesting: boolean;
  requestPairingCode: (event: FormEvent<HTMLFormElement>) => void;
}

const qrReadOf = (value: string | undefined, error: Error | null): WhatsAppQrRead => {
  if (value !== undefined) {
    return { kind: 'shown', value };
  }

  return error === null ? { kind: 'loading' } : { kind: 'failed' };
};

export const useWhatsAppLink = (): WhatsAppLinkControl => {
  const qrCode = useWhatsAppQrCodeQuery();
  const pairing = useWhatsAppPairingCodeMutation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const trimmedPhoneNumber = phoneNumber.trim();

  return {
    qr: qrReadOf(qrCode.data?.value, qrCode.error),
    phoneNumber,
    changePhoneNumber: (event) => {
      setPhoneNumber(event.target.value);
      pairing.reset();
    },
    canRequest: trimmedPhoneNumber !== '',
    pairingCode: pairing.data?.code ?? null,
    isRequesting: pairing.isPending,
    requestPairingCode: (event) => {
      event.preventDefault();
      pairing.mutate(trimmedPhoneNumber);
    },
  };
};

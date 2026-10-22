import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import type { MePasskey } from '@/lib/api/schemas';
import { PASSKEY_EYEBROW, toPasskeyAddedLine } from '../account-security-labels';

interface PasskeyHeaderProps {
  passkey: MePasskey;
}

export const PasskeyHeader: FC<PasskeyHeaderProps> = ({ passkey }) => {
  const addedLine = toPasskeyAddedLine(passkey.addedAt, new Date());

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{PASSKEY_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{passkey.name}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          <KkMeta>{addedLine}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};

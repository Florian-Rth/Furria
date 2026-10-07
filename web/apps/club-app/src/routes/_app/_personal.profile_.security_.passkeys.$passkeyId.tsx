import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PasskeyScreen } from '@/features/account-security';

const PasskeyComponent: FC = () => {
  const { passkeyId } = Route.useParams();

  return <PasskeyScreen passkeyId={passkeyId} />;
};

export const Route = createFileRoute('/_app/_personal/profile_/security_/passkeys/$passkeyId')({
  component: PasskeyComponent,
});

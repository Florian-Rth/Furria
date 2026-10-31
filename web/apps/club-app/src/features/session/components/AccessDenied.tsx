import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';
import { DeniedEscapes } from './DeniedEscapes';

const ACCESS_DENIED_TITLE = 'KEIN ZUGANG';

interface AccessDeniedProps {
  message: string;
}

export const AccessDenied: FC<AccessDeniedProps> = ({ message }) => {
  const escapes = <DeniedEscapes />;

  return <KkEmptyState title={ACCESS_DENIED_TITLE} description={message} action={escapes} />;
};

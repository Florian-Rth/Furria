import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC, ReactNode } from 'react';

const ACCESS_DENIED_TITLE = 'KEIN ZUGANG';

interface AccessDeniedProps {
  message: string;
  action?: ReactNode;
}

export const AccessDenied: FC<AccessDeniedProps> = ({ message, action }) => (
  <KkEmptyState title={ACCESS_DENIED_TITLE} description={message} action={action} />
);

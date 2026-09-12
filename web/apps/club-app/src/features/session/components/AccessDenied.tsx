import { KkAppShell, KkEmptyState } from '@furria/ui';
import { useLocation } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { resolveSectionTitle } from '../app-sections';
import { AppPageHeader } from './AppPageHeader';

const ACCESS_DENIED_TITLE = 'KEIN ZUGANG';

interface AccessDeniedProps {
  message: string;
  action?: ReactNode;
}

export const AccessDenied: FC<AccessDeniedProps> = ({ message, action }) => {
  const location = useLocation();
  const sectionTitle = resolveSectionTitle(location.pathname);

  return (
    <>
      <AppPageHeader>
        <KkAppShell.PageTitle>{sectionTitle}</KkAppShell.PageTitle>
      </AppPageHeader>
      <KkEmptyState title={ACCESS_DENIED_TITLE} description={message} action={action} />
    </>
  );
};

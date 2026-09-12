import { KkAppShell } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

interface AppBackLinkProps {
  label: string;
  to: string;
}

export const AppBackLink: FC<AppBackLinkProps> = ({ label, to }) => (
  <KkAppShell.BackLink label={label} component={Link} to={to} />
);

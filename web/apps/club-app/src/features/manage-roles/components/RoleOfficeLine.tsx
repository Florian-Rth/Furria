import { KkFactLine, KkInlineLink } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { BOARD_OFFICE_PATH, toSeatedLabel } from '../roles-hub-copy';
import type { ImpliedByOffice } from '../schemas';

interface RoleOfficeLineProps {
  office: ImpliedByOffice;
}

export const RoleOfficeLine: FC<RoleOfficeLineProps> = ({ office }) => {
  const params = { boardOfficeId: String(office.boardOfficeId) };
  const link = (
    <KkInlineLink component={Link} to={BOARD_OFFICE_PATH} params={params}>
      {toSeatedLabel(office.seatedCount)}
    </KkInlineLink>
  );

  return <KkFactLine label={office.name} value={link} />;
};

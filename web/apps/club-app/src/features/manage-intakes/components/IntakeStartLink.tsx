import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import type { KkSx } from '@furria/ui/kk-sx';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { INTAKE_NEW_ROUTE, START_BY_QR_LABEL } from '../intake-labels';

interface IntakeStartLinkProps {
  groupId?: number;
  sx?: KkSx;
}

export const IntakeStartLink: FC<IntakeStartLinkProps> = ({ groupId, sx }) => {
  const search = groupId === undefined ? undefined : { group: groupId };

  return (
    <KkButton
      variant="outlined"
      size="small"
      startIcon={<KkIcon name="qr" size="small" />}
      component={Link}
      to={INTAKE_NEW_ROUTE}
      search={search}
      sx={sx}
    >
      {START_BY_QR_LABEL}
    </KkButton>
  );
};

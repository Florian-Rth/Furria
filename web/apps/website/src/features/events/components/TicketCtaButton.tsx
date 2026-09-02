import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import type { TicketPanelCta } from '../ticket-panel-display';

interface TicketCtaButtonProps {
  cta: TicketPanelCta;
  sx?: SxProps<Theme>;
}

export const TicketCtaButton: FC<TicketCtaButtonProps> = ({ cta, sx }) => (
  <Button
    component={RouterLink}
    to={cta.to}
    variant={cta.emphasis}
    color="primary"
    size="large"
    data-kk-ticket-cta
    sx={sx}
  >
    {cta.label}
  </Button>
);

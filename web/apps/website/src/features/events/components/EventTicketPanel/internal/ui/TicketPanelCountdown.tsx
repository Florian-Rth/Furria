import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useCountdown } from '@/features/events/hooks/use-countdown';

interface TicketPanelCountdownProps {
  targetIso: string;
}

export const TicketPanelCountdown: FC<TicketPanelCountdownProps> = ({ targetIso }) => {
  const countdownLabel = useCountdown(targetIso);
  if (countdownLabel === null) {
    return null;
  }

  return (
    <Typography variant="h5" component="p">
      {countdownLabel}
    </Typography>
  );
};

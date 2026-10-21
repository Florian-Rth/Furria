import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { useScrollIntoView } from '../hooks/use-scroll-into-view';

interface CalendarSheetDayProps extends PropsWithChildren {
  focused: boolean;
}

export const CalendarSheetDay: FC<CalendarSheetDayProps> = ({ focused, children }) => {
  const scrollRef = useScrollIntoView(focused);

  return <Box ref={scrollRef}>{children}</Box>;
};

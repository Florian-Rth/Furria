import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';
import type { KkAnswer } from '../../../internal/answer';

const MARKS: Record<KkAnswer, readonly string[]> = {
  yes: ['M5 12.5l4.5 4.5L19 7.5'],
  maybe: ['M9 9.25a3 3 0 1 1 4.2 2.75c-.75.35-1.2 1.1-1.2 1.95v.55', 'M12 18h.01'],
  no: ['M7 7l10 10', 'M17 7L7 17'],
};

interface KkCalendarAgendaAnswerMarkProps {
  answer: KkAnswer;
}

export const KkCalendarAgendaAnswerMark: FC<KkCalendarAgendaAnswerMarkProps> = ({ answer }) => (
  <SvgIcon
    viewBox="0 0 24 24"
    aria-hidden
    sx={{
      width: '1.125rem',
      height: '1.125rem',
      flexShrink: 0,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }}
  >
    {MARKS[answer].map((d) => (
      <path key={d} d={d} />
    ))}
  </SvgIcon>
);
